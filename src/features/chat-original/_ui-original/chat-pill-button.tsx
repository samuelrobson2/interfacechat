import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/lib/css";
import { Button, type ButtonProps } from "@/shared/ui/kit/button";

const chatPillVariants = cva(["bg-background-primary"], {
  variants: {
    shape: {
      "icon-sm": "size-8 p-0",
      "icon-round": "size-11 p-[10px]",
      "pill-icon": "h-8 w-auto px-2 py-1.5 gap-2",
      "pill-text": "h-8 w-auto px-3 py-1.5 gap-2",
    },
    active: {
      true: "border-[#DCB500] bg-(--chat-selection-highlight) hover:bg-(--chat-selection-highlight)",
      false: "",
    },
  },
  defaultVariants: {
    shape: "pill-text",
    active: false,
  },
});

export type ChatPillButtonProps = Omit<
  ButtonProps,
  "variant" | "size" | "radius"
> &
  VariantProps<typeof chatPillVariants>;

export function ChatPillButton({
  shape,
  active,
  className,
  ref,
  ...props
}: ChatPillButtonProps) {
  return (
    <Button
      ref={ref}
      variant="secondary"
      radius="rounded"
      className={cn(chatPillVariants({ shape, active }), className)}
      {...props}
    />
  );
}
