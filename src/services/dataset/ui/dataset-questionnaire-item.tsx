import { Link } from "react-router-dom";
import type { LinkProps } from "react-router-dom";
import { useReducedMotion } from "framer-motion";
import { useRef, type ButtonHTMLAttributes, type Ref } from "react";
import { Text } from "@/shared/ui/kit/text";
import { cn } from "@/shared/lib/css";
import { useProximityBorder } from "@/shared/lib/react/use-proximity-border";
import { LockIcon } from "@/shared/assets/icons/general/Lock";
import { Card } from "@/shared/ui/kit/card";
import { Button } from "@/shared/ui/kit/button";
import {
  TooltipContent,
  TooltipTrigger,
  Tooltip,
} from "@/shared/ui/kit/tooltip";
import { CircleInfoIcon } from "@/shared/assets/icons/general/CircleInfo";
import { AiStarIcon } from "@/shared/assets/icons/outlined/AiStar";
import { Badge } from "@/shared/ui/kit/badge";

type BaseProps = {
  title: React.ReactNode;
  description: React.ReactNode;
  info?: string | null;
  image?: string;
  /** Looping clip that plays while the card is hovered or focused. */
  video?: string;
  imageAlt: string;
  /** Override the default image sizing (defaults to h-[260px]). */
  imageClassName?: string;
  /** Extra classes for the card itself (e.g. tighter padding/gap). */
  cardClassName?: string;
  /** Replace the default grey card border with the iridescent proximity border. */
  proximityBorder?: boolean;
  isLocked?: boolean;
  lockedText?: string;
  selected?: boolean;
  tooltip?: string;
  withBetaBadge?: boolean;
  onUnlock?: () => void;
};

type ButtonPropsType = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  keyof BaseProps
>;
type LinkPropsType = Omit<LinkProps, keyof BaseProps>;

type QuestionnaireItemProps = BaseProps &
  (
    | ({
        as?: "button";
      } & ButtonPropsType)
    | ({
        as: "link";
      } & LinkPropsType)
  );

function LockedOverlay({
  lockedText,
  tooltip,
  onUnlock,
}: {
  lockedText?: string;
  tooltip?: string;
  onUnlock?: () => void;
}) {
  return (
    <>
      <div className="absolute inset-0 bg-background-primary/50 backdrop-blur-[14px] rounded-[24px]" />
      <div className="absolute flex flex-col items-center gap-4">
        <LockIcon className="size-10" pathClasses="stroke-icon-primary" />
        {lockedText && (
          <div className="flex flex-col items-center gap-6">
            <Text variant="title" className="flex items-center gap-2">
              {lockedText}
              {tooltip && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <CircleInfoIcon />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[350px] top-[100px]">
                    {tooltip}
                  </TooltipContent>
                </Tooltip>
              )}
            </Text>
            {onUnlock && (
              <Button
                size="48"
                type="button"
                className="pointer-events-auto"
                onClick={(event) => {
                  event.stopPropagation();
                  onUnlock();
                }}
              >
                Unlock now
              </Button>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export function QuestionnaireItem({
  title,
  description,
  image,
  video,
  imageAlt,
  imageClassName,
  cardClassName,
  proximityBorder = false,
  as = "button",
  isLocked,
  lockedText,
  selected = false,
  info,
  tooltip,
  withBetaBadge = false,
  onUnlock,
  ...props
}: QuestionnaireItemProps) {
  const shouldDimLockedContent = Boolean(isLocked && !tooltip);
  const borderRef = useProximityBorder<HTMLElement>({
    cornerRadius: 8,
    baseOpacity: 0.5,
  });
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduceMotion = useReducedMotion();

  const startVideo = () => {
    if (reduceMotion || !videoRef.current) return;
    void videoRef.current.play();
  };

  const stopVideo = () => {
    const clip = videoRef.current;
    if (!clip) return;
    clip.pause();
    clip.currentTime = 0;
  };

  const baseClassName = cn(
    "w-[428px] rounded-[8px] [--hairline-radius:8px] gap-8 p-8 cursor-pointer",
    !isLocked &&
      "hover:shadow-inset-highlight hover:[--hairline-color:var(--color-blue-4)]",
    !tooltip && "disabled:opacity-50 disabled:cursor-not-allowed",
    // Match the AI box: flat (no grey hairline / inset shadow) + the iridescent
    // proximity border drawn over the top.
    proximityBorder &&
      "shadow-none hover:shadow-none [--hairline-color:transparent] hover:[--hairline-color:transparent] overflow-visible",
    cardClassName,
  );

  const content = (
    <>
      <div className="relative w-full grid place-items-center">
        {video ? (
          <div className={cn("mx-auto mix-blend-multiply", imageClassName)}>
            <video
              ref={videoRef}
              className="block h-[260px] w-auto bg-transparent"
              src={video}
              muted
              loop
              playsInline
              preload="auto"
              aria-label={imageAlt}
            />
          </div>
        ) : image ? (
          <img
            className={cn("h-[260px] w-auto mx-auto", imageClassName)}
            src={image}
            alt={imageAlt}
          />
        ) : (
          <Text color="secondary">{imageAlt}</Text>
        )}

        {isLocked && (
          <LockedOverlay
            lockedText={lockedText}
            tooltip={tooltip}
            onUnlock={onUnlock}
          />
        )}
      </div>

      <div
        className={cn(
          "flex flex-col gap-2 text-left",
          shouldDimLockedContent && "opacity-30",
        )}
      >
        <Text className="flex gap-3 items-center" variant="h2">
          {title}
          {withBetaBadge && (
            <Badge className="gap-0 px-4" size="sm">
              BETA <AiStarIcon pathClasses="bg-gradient-black-blue" />
            </Badge>
          )}
        </Text>
        <Text color="secondary">{description}</Text>
        {info && (
          <Text
            color="secondary"
            className="border-[0.5px] border-stroke-secondary rounded-[6px] px-2 py-1 w-fit"
          >
            {info}
          </Text>
        )}
      </div>
    </>
  );

  if (as === "link") {
    const linkProps = props as LinkPropsType;
    const linkTarget = isLocked ? "#" : linkProps.to;

    return (
      <Card asChild highlight={selected} className={baseClassName}>
        <Link
          ref={
            proximityBorder ? (borderRef as Ref<HTMLAnchorElement>) : undefined
          }
          aria-disabled={isLocked}
          className={cn(linkProps.className, isLocked && "cursor-not-allowed")}
          {...linkProps}
          to={linkTarget}
          onMouseEnter={startVideo}
          onMouseLeave={stopVideo}
          onFocus={startVideo}
          onBlur={stopVideo}
        >
          {content}
        </Link>
      </Card>
    );
  }

  const buttonProps = props as ButtonPropsType;
  return (
    <Card asChild highlight={selected} className={baseClassName}>
      <button
        ref={
          proximityBorder ? (borderRef as Ref<HTMLButtonElement>) : undefined
        }
        aria-disabled={isLocked}
        className={cn(
          buttonProps.className,
          isLocked && !tooltip && "pointer-events-none",
        )}
        {...buttonProps}
        onMouseEnter={startVideo}
        onMouseLeave={stopVideo}
        onFocus={startVideo}
        onBlur={stopVideo}
      >
        {content}
      </button>
    </Card>
  );
}
