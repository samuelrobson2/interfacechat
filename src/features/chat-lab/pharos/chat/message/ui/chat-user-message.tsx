import { cn } from "@/shared/lib/css";
import { Text } from "@/shared/ui/kit/text";

export function ChatUserMessageLayout({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col items-end gap-3", className)} {...props}>
      {children}
    </div>
  );
}

export function ChatUserMessage({
  text,
  variant = "bubble",
  className,
  render,
  ...props
}: React.ComponentProps<"div"> & {
  text: string;
  variant?: "bubble" | "block";
  /** Draws the text (a host's own marks, such as "@Table" as its interface); plain text without it. */
  render?: (text: string) => React.ReactNode;
}) {
  const isBlock = variant === "block";

  return (
    <div
      className={cn(
        "min-w-0 max-w-full rounded-[16px] px-4 py-5",
        isBlock && "w-full bg-[#e5e5e5]",
        !isBlock && "w-fit self-end bg-gray-6",
        className,
      )}
      {...props}
    >
      <Text
        variant="label"
        className="whitespace-pre-wrap wrap-anywhere"
      >
        {render ? render(text) : text}
      </Text>
    </div>
  );
}
