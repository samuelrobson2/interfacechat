import { useEffect, useRef } from "react";
import { cn } from "@/shared/lib/css";
import type { WorkbenchMessage } from "../model/workbench-store";

/**
 * A stand-in conversation for the workbench. A reply can carry an interface,
 * shown inline under its text. The input is passed in: the page owns it, so
 * it can stay on screen when Chat is minimized.
 */
export function WorkbenchChat({
  messages,
  compact,
  composer,
  renderInline,
}: {
  messages: WorkbenchMessage[];
  /** Narrow: tighter padding. */
  compact: boolean;
  /** Chat's input, while Chat is open. */
  composer: React.ReactNode;
  /** The interface a reply carries, drawn under its text. */
  renderInline: (message: WorkbenchMessage & { inline: string }) => React.ReactNode;
}) {
  const listRef = useRef<HTMLDivElement>(null);
  const count = messages.length;
  const open = Boolean(composer);

  // Newest at the bottom: on a new turn, and when Chat opens again.
  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTo({ top: list.scrollHeight, behavior: open ? "smooth" : "auto" });
  }, [count, open]);

  return (
    <div className="flex h-full flex-col font-bureau">
      <div
        ref={listRef}
        className={cn("flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pt-2 pb-4", compact ? "px-2" : "px-4")}
      >
        <div className={cn("mx-auto flex w-full flex-col gap-3", !compact && "max-w-[660px]")}>
          {messages.map((message) => (
            <div key={message.id} className="flex flex-col gap-1">
              <div className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[85%] rounded-[16px] px-3.5 py-2 text-[14px] leading-[1.45] whitespace-pre-line text-typography-primary",
                    message.role === "user" && "bg-gray-6",
                  )}
                >
                  {message.text}
                </div>
              </div>
              {/* Interfaces line up with the reply's text, 14px in; theirs is 24px. */}
              {message.inline && (
                <div className="-mx-2.5 flex flex-col">{renderInline({ ...message, inline: message.inline })}</div>
              )}
            </div>
          ))}
        </div>
      </div>
      {composer && (
        <div className={cn("shrink-0 pb-1", compact ? "px-2" : "px-4")}>
          <div className={cn("mx-auto w-full", !compact && "max-w-[660px]")}>{composer}</div>
        </div>
      )}
    </div>
  );
}
