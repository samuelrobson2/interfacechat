import { cn } from "@/shared/lib/css";
import { Text } from "@/shared/ui/kit/text";
import React from "react";

export function ChatLayout({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "max-w-[660px] mx-auto overflow-hidden relative",
        className,
      )}
      {...props}
    />
  );
}

export function ChatInputLayout({
  className,
  ref,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      ref={ref}
      className={cn(
        "flex w-full flex-col gap-4 overflow-hidden rounded-[16px] bg-background",
        className,
      )}
      {...props}
    />
  );
}

export function ChatComposerLayout({
  className,
  ref,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      ref={ref}
      className={cn(
        "pointer-events-none absolute bottom-0 left-1/2 z-20 w-full -translate-x-1/2 rounded-[20px] py-8",
        "before:absolute before:inset-0 before:rounded-[20px] before:backdrop-blur-sm before:mask-[linear-gradient(to_bottom,transparent,black_60%,black)] before:content-['']",
        "after:absolute after:inset-0 after:rounded-[20px] after:bg-[linear-gradient(to_bottom,rgba(250,250,250,0),rgba(250,250,250,0.95)_60%,rgba(250,250,250,1))] after:content-['']",
        "*:relative *:z-10",
        className,
      )}
      {...props}
    />
  );
}

export function ChatHeader({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className="absolute top-0 left-0 z-30 h-[52px] w-full bg-gray-1/20 backdrop-blur-sm backdrop-saturate-150 transition-all duration-300">
      <div
        className={cn(
          "mx-auto h-full w-[660px] border-b border-gray-2",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </div>
  );
}

type ChatQuoteBlockProps = React.ComponentProps<"aside"> & {
  quote?: string;
  author?: string;
};

export function ChatQuoteBlock({
  className,
  ref,
  quote,
  author,
  ...props
}: ChatQuoteBlockProps) {
  if (!quote) return null;

  return (
    <aside
      ref={ref}
      className={cn(
        "flex w-[212px] flex-col gap-2 border-l border-gray-3 pl-4",
        className,
      )}
      {...props}
    >
      <Text
        color="secondary"
        className="leading-[20px] whitespace-pre-wrap font-medium"
      >
        {`\u201C${quote}\u201D`}
      </Text>
      {author && (
        <Text
          color="secondary"
          className="text-right"
        >
          {`\u2013 ${author}`}
        </Text>
      )}
    </aside>
  );
}
