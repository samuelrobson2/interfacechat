import { useCallback, useRef } from "react";
import { cn } from "@/shared/lib/css";
import { textVariants } from "@/shared/ui/kit/text";

export function ChatTitleInput({
  value,
  onValueChange,
  onSave,
  onCancel,
  className,
}: {
  value: string;
  onValueChange: (value: string) => void;
  /** Called on Enter or blur with the current value. */
  onSave: (value: string) => void;
  /** Called on Escape to discard the edit. */
  onCancel: () => void;
  className?: string;
}) {
  // Guard so the blur fired while unmounting doesn't re-trigger a commit/cancel.
  const isCommittedRef = useRef(false);

  const focusOnMount = useCallback((node: HTMLInputElement | null) => {
    node?.focus();
    node?.select();
  }, []);

  const handleSave = () => {
    if (isCommittedRef.current) return;
    isCommittedRef.current = true;
    onSave(value);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSave();
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      isCommittedRef.current = true;
      onCancel();
    }
  };

  return (
    <input
      ref={focusOnMount}
      type="text"
      value={value}
      maxLength={500}
      aria-label="Chat title"
      onChange={(event) => onValueChange(event.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={handleSave}
      className={cn(
        textVariants({ variant: "label", weight: "regular" }),
        "max-md:text-[16px]",
        "w-full bg-transparent text-start outline-none",
        className,
      )}
    />
  );
}
