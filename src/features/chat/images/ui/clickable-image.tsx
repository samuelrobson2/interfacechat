import { cn } from "@/shared/lib/css";

export function ClickableImage({
  className,
  children,
  ...props
}: React.ComponentProps<"button"> & {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className={cn(
        "cursor-pointer focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:cursor-default",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
