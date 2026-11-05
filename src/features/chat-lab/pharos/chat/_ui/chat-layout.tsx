import { LoaderIcon } from "@/shared/assets/icons/outlined/Loader";
import { cn } from "@/shared/lib/css";
import { Text } from "@/shared/ui/kit/text";
import React from "react";

export function ChatLayout({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("max-w-[660px] mx-auto relative", className)}
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
        "pointer-events-none absolute bottom-0 left-1/2 z-20 w-full -translate-x-1/2 rounded-[20px] pt-8 pb-6 md:py-8",
        "before:absolute before:inset-0 before:rounded-[20px] before:backdrop-blur-sm before:mask-[linear-gradient(to_bottom,transparent,black_60%,black)] before:content-['']",
        "after:absolute after:inset-0 after:rounded-[20px] after:bg-[linear-gradient(to_bottom,rgba(250,250,250,0),rgba(250,250,250,0.95)_60%,rgba(250,250,250,1))] after:content-['']",
        "*:relative *:z-10",
        className,
      )}
      {...props}
    />
  );
}

export function ChatHeaderLoader() {
  return (
    <span role="status" aria-label="Loading" className="flex size-5">
      <LoaderIcon
        aria-hidden
        svgClasses="size-5 animate-spin"
        pathClasses="stroke-icon-primary"
      />
    </span>
  );
}

export function ChatHeader({
  start,
  end,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  start?: React.ReactNode;
  end?: React.ReactNode;
}) {
  return (
    <div className="absolute top-0 left-0 z-30 h-[72px] w-full bg-gray-1/35 backdrop-blur-sm transition-all duration-300 md:h-[52px]">
      <div
        className={cn(
          "relative mx-auto h-full w-full px-18 md:w-[660px] md:px-0",
          className,
        )}
        {...props}
      >
        <div className="flex h-full flex-col items-center justify-center gap-1 md:grid md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:items-center md:gap-x-2">
          <div className="flex min-w-0 max-w-full items-center justify-center gap-2 md:contents">
            {start != null && (
              <div className="flex min-w-0 max-w-full justify-center overflow-hidden md:col-start-1 md:row-start-1 md:justify-start">
                {start}
              </div>
            )}
            {end != null && (
              <div className="flex shrink-0 items-center md:col-start-3 md:row-start-1 md:justify-end">
                {end}
              </div>
            )}
          </div>
          <div
            className={cn(
              "flex justify-center md:col-start-2 md:row-start-1",
            )}
          >
            {children}
          </div>
        </div>
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
        <Text color="secondary" className="text-right">
          {`\u2013 ${author}`}
        </Text>
      )}
    </aside>
  );
}
