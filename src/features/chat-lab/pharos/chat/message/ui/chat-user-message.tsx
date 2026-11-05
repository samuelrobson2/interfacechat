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
  ...props
}: React.ComponentProps<"div"> & {
  text: string;
  variant?: "bubble" | "block";
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
        {text}
      </Text>
    </div>
  );
}
