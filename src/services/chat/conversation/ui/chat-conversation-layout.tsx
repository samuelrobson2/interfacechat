import { cn } from "@/shared/lib/css";

export function ChatConversationLayout({
  className,
  contentRef,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  contentRef?: React.Ref<HTMLDivElement>;
}) {
  return (
    <div
      className={cn("relative h-full overflow-y-auto no-scrollbar", className)}
      {...props}
    >
      <div
        className="mx-auto flex w-full flex-col gap-6 px-4 md:w-[660px] md:px-0"
        data-slot="chat-area"
        ref={contentRef}
      >
        {children}
      </div>
    </div>
  );
}
