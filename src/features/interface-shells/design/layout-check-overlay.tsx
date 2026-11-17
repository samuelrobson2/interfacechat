import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { checkAll, type LayoutIssue } from "./layout-check";

/**
 * The layout check, live on the Design System page: every problem the
 * checker finds (`layout-check.ts`) outlined where it is, with what it is,
 * and a count. It re-checks as tokens change, so a fix shows at once.
 */
export function LayoutCheckOverlay({ container, on }: { container: React.RefObject<HTMLElement | null>; on: boolean }) {
  const [found, setFound] = useState<{ title: string; issue: LayoutIssue; rect: DOMRect }[]>([]);

  useEffect(() => {
    const root = container.current;
    if (!on || !root) return;
    const run = () =>
      setFound(
        checkAll(root).flatMap(({ title, issues }) => issues.map((issue) => ({ title, issue, rect: issue.element.getBoundingClientRect() }))),
      );
    const first = window.setTimeout(run, 0);
    const timer = window.setInterval(run, 600);
    const onScroll = () => run();
    root.addEventListener("scroll", onScroll, true);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(timer);
      setFound([]);
      root.removeEventListener("scroll", onScroll, true);
    };
  }, [container, on]);

  if (!on) return null;
  return createPortal(
    <div aria-live="polite" className="pointer-events-none fixed inset-0 z-[56]">
      {found.map(({ issue, rect }, i) => (
        <div
          key={i}
          title={issue.detail}
          className="absolute rounded-[3px] outline-2 outline-[#f76666] outline-dashed"
          style={{ left: rect.left, top: rect.top, width: rect.width, height: rect.height }}
        />
      ))}
      <div className="pointer-events-auto fixed bottom-4 left-[136px] max-h-[40vh] max-w-[560px] overflow-y-auto rounded-[12px] bg-gray-5 px-3 py-2 font-bureau text-[12px] text-white shadow-[0_4px_14px_rgba(26,23,24,0.2)]">
        {found.length === 0 ? (
          "Layout check: every interface lines up with the guides, nothing spills or overlaps."
        ) : (
          <>
            <div className="mb-1">{`Layout check: ${found.length} ${found.length === 1 ? "problem" : "problems"}`}</div>
            <ul className="flex flex-col gap-0.5 text-white/85">
              {found.slice(0, 30).map(({ title, issue }, i) => (
                <li key={i}>{`${title} · ${issue.kind} · ${issue.part}: ${issue.detail}`}</li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}
