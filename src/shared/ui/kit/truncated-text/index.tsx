import * as React from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../tooltip";
import { Text, type TextProps } from "../text";
import { cn } from "@/shared/lib/css";

interface TruncatedTextProps extends Omit<TextProps, "as"> {
  maxLines?: number;
  tooltipContent?: React.ReactNode;
}

function TruncatedText({
  children,
  className,
  maxLines = 1,
  tooltipContent,
  ...textProps
}: TruncatedTextProps) {
  const textRef = React.useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = React.useState(false);

  const checkOverflow = React.useCallback(() => {
    if (!textRef.current) return;

    const element = textRef.current;

    if (maxLines === 1) {
      setIsOverflowing(element.scrollWidth > element.clientWidth);
    } else {
      setIsOverflowing(element.scrollHeight > element.clientHeight);
    }
  }, [maxLines]);

  React.useLayoutEffect(() => {
    checkOverflow();

    const resizeObserver = new ResizeObserver(checkOverflow);
    if (textRef.current) {
      resizeObserver.observe(textRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [checkOverflow]);

  const getLineClampStyles = (lines: number) => {
    if (lines === 1)
      return {
        "whiteSpace": "nowrap",
        "textOverflow": "ellipsis",
      };

    return {
      display: "-webkit-box",
      WebkitLineClamp: lines,
      WebkitBoxOrient: "vertical" as const,
    };
  };

  const textElement = (
    <Text
      ref={textRef}
      className={cn("overflow-hidden", className)}
      style={getLineClampStyles(maxLines)}
      {...textProps}
    >
      {children}
    </Text>
  );

  if (!isOverflowing) return textElement;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{textElement}</TooltipTrigger>
      <TooltipContent className="whitespace-pre-wrap">
        {tooltipContent || children}
      </TooltipContent>
    </Tooltip>
  );
}

export { TruncatedText, type TruncatedTextProps };
