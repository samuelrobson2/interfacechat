import { cn } from "@/shared/lib/css";
import { textVariants } from "@/shared/ui/kit/text";

export function ControlBrandSettingsTextarea({
  className,
  ...props
}: React.ComponentProps<"textarea">) {
  return (
    <textarea
      {...props}
      className={cn(
        textVariants({ variant: "body" }),
        "w-full h-full bg-transparent outline-none resize-none",
        "placeholder:text-typography-secondary",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "min-h-[48px]",
        // Custom scrollbar styling
        "[&::-webkit-scrollbar]:w-[2px]",
        "[&::-webkit-scrollbar-track]:bg-transparent",
        "[&::-webkit-scrollbar-thumb]:bg-stroke-primary [&::-webkit-scrollbar-thumb]:rounded-[8px]",
        "[&::-webkit-scrollbar-thumb]:hover:bg-border-primary",
        className,
      )}
    />
  );
}
