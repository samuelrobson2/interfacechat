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
  // "block" is the full-width variant the interface editor's chat panel uses,
  // where the column is narrow enough that a right-aligned bubble reads badly.
  variant?: "bubble" | "block";
}) {
  const isBlock = variant === "block";

  return (
    <div
      className={cn(
        "rounded-[16px] border px-4 py-5",
        isBlock && "w-full border-gray-2/20 bg-[#e5e5e5]",
        !isBlock && "w-fit self-end border-gray-2 bg-gray-6",
        className,
      )}
      {...props}
    >
      <Text variant={isBlock ? "label" : "caption"} color="secondary">
        {text}
      </Text>
    </div>
  );
}
