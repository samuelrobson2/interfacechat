import { useCallback, useRef, useState } from "react";
import { cn } from "@/shared/lib/css";
import { textVariants } from "@/shared/ui/kit/text";

type ChatTitleInputProps = {
  /** Title shown when the field mounts; the field is otherwise uncontrolled. */
  initialValue: string;
  /** Called on Enter or blur with the current value. */
  onSave: (value: string) => void;
  /** Called on Escape to discard the edit. */
  onCancel: () => void;
  className?: string;
};

export function ChatTitleInput({
  initialValue,
  onSave,
  onCancel,
  className,
}: ChatTitleInputProps) {
  const [value, setValue] = useState(initialValue);
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
      onChange={(event) => setValue(event.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={handleSave}
      className={cn(
        textVariants({ variant: "label", color: "secondary" }),
        "w-[480px] max-w-[70vw] bg-transparent text-center outline-none",
        className,
      )}
    />
  );
}
