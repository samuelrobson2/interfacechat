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
  className,
  ...props
}: React.ComponentProps<"div"> & { text: string }) {
  return (
    <div
      className={cn(
        "rounded-[16px] border border-gray-2 bg-gray-6 px-4 py-5",
        "w-fit self-end",
        className,
      )}
      {...props}
    >
      <Text variant="caption" color="secondary">
        {text}
      </Text>
    </div>
  );
}
