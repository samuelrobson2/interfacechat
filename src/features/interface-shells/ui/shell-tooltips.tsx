import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Tooltips for every tool in an interface's toolbar, standard or AI.
 *
 * Tools already carry their name (`title`, and `aria-label` for the icon
 * ones), so rather than wrap each kind of tool, one listener shows that name
 * in a styled tooltip: after a short pause on hover, at once on keyboard
 * focus, and straight away when moving along the row once one is showing,
 * as macOS and Figma do. The native tooltip is held back while it shows.
 * Disabled tools get one too, so a greyed-out icon still says what it is.
 *
 * Mounted once, in the app.
 */

const TOOLBAR = '[data-shell-part="tools"]';
const DELAY = 400;
/** Moving to the next tool within this long shows its tip at once. */
const WARM = 600;

type Tip = { text: string; rect: DOMRect };

const tipText = (element: HTMLElement) => element.dataset.tip ?? element.getAttribute("title") ?? element.getAttribute("aria-label") ?? "";

function targetOf(node: EventTarget | null): HTMLElement | null {
  const element = node instanceof Element ? node : null;
  const tool = element?.closest<HTMLElement>(`${TOOLBAR} [title], ${TOOLBAR} [data-tip], ${TOOLBAR} button[aria-label]`);
  return tool && tool.closest(TOOLBAR) ? tool : null;
}

export function ShellTooltips() {
  const [tip, setTip] = useState<Tip | null>(null);

  useEffect(() => {
    let current: HTMLElement | null = null;
    let timer = 0;
    let hiddenAt = 0;

    // Keep the native tooltip from showing as well: its text moves to data-tip while ours shows.
    const quiet = (element: HTMLElement) => {
      const title = element.getAttribute("title");
      if (title) {
        element.dataset.tip = title;
        element.removeAttribute("title");
      }
    };
    const show = (element: HTMLElement) => {
      // A tool whose menu or panel is open doesn't need its name over it.
      if (element.getAttribute("aria-expanded") === "true" || element.dataset.state === "open") return;
      const text = tipText(element).trim();
      if (text) setTip({ text, rect: element.getBoundingClientRect() });
    };
    const hide = () => {
      window.clearTimeout(timer);
      if (current) hiddenAt = Date.now();
      current = null;
      setTip(null);
    };
    // When the tool's own menu or panel opens, its tooltip goes.
    const opened = new MutationObserver(() => {
      if (current && (current.getAttribute("aria-expanded") === "true" || current.dataset.state === "open")) hide();
    });
    const enter = (element: HTMLElement, now: boolean) => {
      if (element === current) return;
      window.clearTimeout(timer);
      current = element;
      opened.disconnect();
      opened.observe(element, { attributes: true, attributeFilter: ["aria-expanded", "data-state"] });
      quiet(element);
      if (now || Date.now() - hiddenAt < WARM) show(element);
      else {
        setTip(null);
        timer = window.setTimeout(() => current === element && show(element), DELAY);
      }
    };

    const onOver = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      const element = targetOf(event.target);
      if (element) enter(element, false);
      else if (current) hide();
    };
    const onFocus = (event: FocusEvent) => {
      const element = targetOf(event.target);
      if (element && (event.target as HTMLElement).matches?.(":focus-visible")) enter(element, true);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") hide();
    };

    document.addEventListener("pointerover", onOver);
    document.addEventListener("pointerdown", hide, true);
    document.addEventListener("focusin", onFocus);
    document.addEventListener("focusout", hide);
    document.addEventListener("scroll", hide, true);
    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(timer);
      opened.disconnect();
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerdown", hide, true);
      document.removeEventListener("focusin", onFocus);
      document.removeEventListener("focusout", hide);
      document.removeEventListener("scroll", hide, true);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  if (!tip) return null;
  // Under the tool (above it near the bottom of the window), centred, kept on screen.
  const centre = Math.max(128, Math.min(window.innerWidth - 128, tip.rect.left + tip.rect.width / 2));
  const below = tip.rect.bottom + 6 + 28 < window.innerHeight;
  return createPortal(
    <div
      role="tooltip"
      className="pointer-events-none fixed z-[70] max-w-[240px] -translate-x-1/2 rounded-[6px] bg-gray-5 px-2 py-1 font-bureau text-[12px] leading-[1.35] whitespace-nowrap text-white shadow-[0_2px_8px_rgba(26,23,24,0.18)]"
      style={{ left: centre, top: below ? tip.rect.bottom + 6 : undefined, bottom: below ? undefined : window.innerHeight - tip.rect.top + 6 }}
    >
      {tip.text}
    </div>,
    document.body,
  );
}
