import { cn } from "@/shared/lib/css";

export function ChatConversationLayout({
  className,
  contentClassName,
  contentRef,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  contentRef?: React.Ref<HTMLDivElement>;
  /** Overrides the default centered 660px message column. */
  contentClassName?: string;
}) {
  return (
    <div
      className={cn("relative h-full overflow-y-auto no-scrollbar", className)}
      {...props}
    >
      <div
        className={cn(
          "mx-auto flex w-full flex-col gap-6 px-4 md:w-[660px] md:px-0",
          contentClassName,
        )}
        data-slot="chat-area"
        ref={contentRef}
      >
        {children}
      </div>
    </div>
  );
}
