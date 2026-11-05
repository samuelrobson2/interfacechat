import { cn } from "@/shared/lib/css";
import { Settings } from "lucide-react";
import { useState } from "react";

/** A tiny on/off switch used inside the dev-tools menu. */
function Toggle({ on }: { on: boolean }) {
  return (
    <span
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors",
        on ? "bg-blue-4" : "bg-gray-3/40",
      )}
    >
      <span
        className={cn(
          "absolute size-4 rounded-full bg-white shadow-sm transition-transform",
          on ? "translate-x-[18px]" : "translate-x-[2px]",
        )}
      />
    </span>
  );
}

/**
 * A small dev-tools menu pinned to the bottom-right — a gear you click to try
 * alternate workspace layouts. Right now it toggles the Build/Studio switcher
 * between living in the sidebar and floating above the content.
 */
export function WorkspaceDevTools({
  floatingSwitcher,
  onToggleFloatingSwitcher,
}: {
  floatingSwitcher: boolean;
  onToggleFloatingSwitcher: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      {open && (
        <div
          className={cn(
            "w-60 overflow-hidden rounded-[16px] bg-background-primary p-1.5 font-bureau",
            "shadow-[0_16px_40px_-16px_rgba(0,0,0,0.28)] hairline [--hairline-radius:16px]",
            "[--hairline-color:var(--color-gray-3)] [--hairline-opacity:0.25]",
          )}
        >
          <p className="px-2 pb-1 pt-1.5 text-[11px] font-light uppercase tracking-wide text-gray-3">
            Dev tools · Layout
          </p>
          <button
            type="button"
            onClick={onToggleFloatingSwitcher}
            className="flex w-full items-center justify-between gap-3 rounded-[10px] px-2 py-2 text-left transition-colors hover:bg-gray-6"
          >
            <span className="min-w-0">
              <span className="block text-[14px] text-typography-primary">
                Floating switcher
              </span>
              <span className="block text-[12px] text-typography-secondary">
                Studio/Build toggle above the content
              </span>
            </span>
            <Toggle on={floatingSwitcher} />
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Dev tools"
        aria-expanded={open}
        className={cn(
          "grid size-10 place-items-center rounded-full bg-background-primary text-icon-secondary",
          "shadow-[0_8px_24px_-8px_rgba(0,0,0,0.25)] hairline [--hairline-radius:9999px]",
          "[--hairline-color:var(--color-gray-3)] [--hairline-opacity:0.3]",
          "transition-[color,transform] hover:text-icon-primary",
          open && "text-icon-primary [transform:rotate(30deg)]",
        )}
      >
        <Settings className="size-5" />
      </button>
    </div>
  );
}
