import { Link } from "react-router-dom";
import { type Transition } from "motion/react";
import { PlusSmallIcon } from "@/shared/assets/icons/outlined/PlusSmall";
import { cn } from "@/shared/lib/css";
import { Text } from "@/shared/ui/kit/text";
import { ChatSurfaceFrame } from "./chat-surface-frame";

const CONTENT_CLASS = "flex h-full flex-col justify-between p-4 text-left outline-none";

export function ChatCreateCard({
  to,
  title,
  ariaLabel,
  onClick,
  className,
  layoutId,
  layoutTransition,
  pressScale,
}: {
  to?: string;
  title: string;
  ariaLabel?: string;
  onClick?: () => void;
  className?: string;
  layoutId?: string;
  layoutTransition?: Transition;
  pressScale?: number;
}) {
  const label = ariaLabel ?? title;
  const content = (
    <>
      <Text variant="label" color="secondary" className="line-clamp-3">
        {title}
      </Text>

      <div className="flex justify-end">
        <PlusSmallIcon svgClasses="size-4" />
      </div>
    </>
  );

  return (
    <ChatSurfaceFrame
      gradientStroke="hover"
      className={className}
      layoutId={layoutId}
      layoutTransition={layoutTransition}
      pressScale={pressScale}
    >
      {to ? (
        <Link to={to} aria-label={label} className={CONTENT_CLASS}>
          {content}
        </Link>
      ) : (
        <button
          type="button"
          aria-label={label}
          onClick={onClick}
          className={cn(CONTENT_CLASS, "w-full cursor-pointer")}
        >
          {content}
        </button>
      )}
    </ChatSurfaceFrame>
  );
}
