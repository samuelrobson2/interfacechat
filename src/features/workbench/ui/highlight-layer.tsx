import { useEffect, useRef, useState } from "react";
import {
  CustomFollowupTextarea,
  FollowupBackButton,
  FollowupSuggestionButton,
} from "@/services/chat";
import { ArrowRightIcon } from "@/shared/assets/icons/outlined/ArrowRight";
import { ArrowUpIcon } from "@/shared/assets/icons/outlined/ArrowUp";
import { PlusSmallIcon } from "@/shared/assets/icons/outlined/PlusSmall";
import { cn } from "@/shared/lib/css";
import { Text } from "@/shared/ui/kit/text";

/** Edits offered for anything highlighted, before "Ask something else". */
const SUGGESTIONS = ["Make this shorter", "Make this clearer", "Say more about this"];

const POPOVER_WIDTH = 280;
const QUOTE_LIMIT = 120;

/** The words of what was picked: a field's value, or the text it shows. */
function quoteOf(element: Element): string {
  const raw =
    element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement
      ? element.value || element.placeholder
      : element instanceof HTMLElement
        ? element.innerText
        : (element.textContent ?? "");
  const text = raw.replace(/\s+/g, " ").trim();
  return text.length > QUOTE_LIMIT ? `${text.slice(0, QUOTE_LIMIT - 1)}…` : text;
}

/**
 * Highlight inside one interface: hover outlines a part, a click highlights
 * it, and Chat's edit suggestions open beside it. Pointer presses go to the
 * picker while it's on, so fields don't take focus. Escape clears the
 * highlight, then turns the tool off.
 */
export function HighlightLayer({
  rootRef,
  onEdit,
  onExit,
}: {
  /** The interface's body: what can be highlighted. */
  rootRef: React.RefObject<HTMLElement | null>;
  onEdit: (quote: string, instruction: string) => void;
  onExit: () => void;
}) {
  const [hovered, setHovered] = useState<Element | null>(null);
  const [picked, setPicked] = useState<{ element: Element; quote: string } | null>(null);
  const [custom, setCustom] = useState(false);
  const [text, setText] = useState("");
  const uiRef = useRef<HTMLDivElement>(null);
  const hoverBox = useRef<HTMLDivElement>(null);
  const pickBox = useRef<HTMLDivElement>(null);
  const popover = useRef<HTMLDivElement>(null);

  const clear = () => {
    setPicked(null);
    setCustom(false);
    setText("");
  };

  // The picker: listens on the interface only, in the capture phase.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const targetOf = (event: Event) => {
      const target = event.target;
      if (!(target instanceof Element) || !root.contains(target)) return null;
      if (uiRef.current?.contains(target)) return null;
      // Some parts stay usable while highlighting, such as Chat's input.
      if (target.closest("[data-highlight-skip]")) return null;
      return target;
    };
    const onMove = (event: PointerEvent) => setHovered(targetOf(event));
    const onLeave = () => setHovered(null);
    const block = (event: Event) => {
      if (!targetOf(event)) return;
      event.preventDefault();
      event.stopPropagation();
    };
    const onClick = (event: MouseEvent) => {
      const target = targetOf(event);
      if (!target) return;
      event.preventDefault();
      event.stopPropagation();
      setPicked({ element: target, quote: quoteOf(target) });
      setCustom(false);
      setText("");
    };
    root.addEventListener("pointermove", onMove, true);
    root.addEventListener("pointerleave", onLeave);
    root.addEventListener("pointerdown", block, true);
    root.addEventListener("mousedown", block, true);
    root.addEventListener("click", onClick, true);
    root.style.cursor = "crosshair";
    return () => {
      root.removeEventListener("pointermove", onMove, true);
      root.removeEventListener("pointerleave", onLeave);
      root.removeEventListener("pointerdown", block, true);
      root.removeEventListener("mousedown", block, true);
      root.removeEventListener("click", onClick, true);
      root.style.cursor = "";
    };
  }, [rootRef]);

  const pickedRef = useRef(picked);
  const exitRef = useRef(onExit);
  useEffect(() => {
    pickedRef.current = picked;
    exitRef.current = onExit;
  });
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (pickedRef.current) clear();
      else exitRef.current();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Outlines and the popover follow their element as the interface scrolls,
  // reflows or animates to a new size.
  useEffect(() => {
    let frame = 0;
    const place = (box: HTMLDivElement | null, element: Element | null | undefined, rootBox: DOMRect) => {
      if (!box) return null;
      if (!element?.isConnected) {
        box.style.display = "none";
        return null;
      }
      const rect = element.getBoundingClientRect();
      box.style.display = "block";
      box.style.transform = `translate(${rect.left - rootBox.left - 2}px, ${rect.top - rootBox.top - 2}px)`;
      box.style.width = `${rect.width + 4}px`;
      box.style.height = `${rect.height + 4}px`;
      return rect;
    };
    const tick = () => {
      const root = rootRef.current;
      if (root) {
        const rootBox = root.getBoundingClientRect();
        place(hoverBox.current, hovered === picked?.element ? null : hovered, rootBox);
        const rect = place(pickBox.current, picked?.element, rootBox);
        const card = popover.current;
        if (card && rect) {
          const below = rect.bottom - rootBox.top + 8;
          const above = rect.top - rootBox.top - 8 - card.offsetHeight;
          const top = below + card.offsetHeight <= rootBox.height - 8 || above < 8 ? below : above;
          const left = Math.min(Math.max(8, rect.left - rootBox.left), rootBox.width - POPOVER_WIDTH - 8);
          card.style.transform = `translate(${Math.max(8, left)}px, ${Math.max(8, top)}px)`;
        }
      }
      frame = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(frame);
  }, [rootRef, hovered, picked]);

  const send = (instruction: string) => {
    if (!picked || !instruction.trim()) return;
    onEdit(picked.quote, instruction.trim());
    clear();
  };

  return (
    <div ref={uiRef} className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
      <div
        ref={hoverBox}
        aria-hidden
        className="absolute top-0 left-0 hidden rounded-[6px] border border-dashed border-blue-4 bg-blue-1/30"
      />
      <div
        ref={pickBox}
        aria-hidden
        className="absolute top-0 left-0 hidden rounded-[6px] border border-blue-5 bg-blue-1/50"
      />
      {picked && (
        <div
          ref={popover}
          role="dialog"
          aria-label="Change what's highlighted"
          className="pointer-events-auto absolute top-0 left-0 flex flex-col items-start gap-2 rounded-[20px] bg-background-primary/85 p-2 shadow-[0_8px_28px_rgba(26,23,24,0.12)] backdrop-blur-md"
          style={{ width: POPOVER_WIDTH }}
        >
          {picked.quote && (
            <Text
              variant="caption"
              color="secondary"
              className="max-w-full truncate px-1"
            >
              “{picked.quote}”
            </Text>
          )}
          {custom ? (
            <>
              <FollowupBackButton
                aria-label="Back to edit suggestions"
                onClick={() => {
                  setCustom(false);
                  setText("");
                }}
              />
              <CustomFollowupTextarea
                autoFocus
                value={text}
                onChange={(event) => setText(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    send(text);
                  }
                }}
                rows={3}
                placeholder="Describe the change"
                actions={
                  <button
                    type="button"
                    disabled={!text.trim()}
                    aria-label="Submit edit"
                    onClick={() => send(text)}
                    className={cn(
                      "inline-flex size-4 cursor-pointer items-center justify-center transition-opacity",
                      !text.trim() && "cursor-not-allowed opacity-50",
                    )}
                  >
                    <ArrowUpIcon svgClasses="size-4" />
                  </button>
                }
              />
            </>
          ) : (
            <>
              {SUGGESTIONS.map((suggestion) => (
                <FollowupSuggestionButton
                  key={suggestion}
                  label={suggestion}
                  hideEndIconUntilHover
                  endIcon={<ArrowRightIcon svgClasses="size-4" />}
                  onClick={() => send(suggestion)}
                />
              ))}
              <FollowupSuggestionButton
                label="Ask something else"
                endIcon={<PlusSmallIcon svgClasses="size-3" />}
                onClick={() => setCustom(true)}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}
