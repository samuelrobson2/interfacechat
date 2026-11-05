import * as React from "react";
import { Text, type TextProps } from "../text";
import { cn } from "@/shared/lib/css";
import { Button } from "../button";

interface ExpandedTextProps extends Omit<TextProps, "as"> {
  maxLines?: number;
  seeMoreText?: string;
  seeLessText?: string;
}

function ExpandedText({
  children,
  className,
  maxLines = 3,
  seeMoreText = "See more",
  seeLessText = "See less",
  ...textProps
}: ExpandedTextProps) {
  const textRef = React.useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = React.useState(false);
  const [isExpanded, setIsExpanded] = React.useState(false);

  // Check if text is overflowing
  const checkOverflow = React.useCallback(() => {
    if (!textRef.current) return;

    const element = textRef.current;

    // Always check by height - works for both single and multi-line
    setIsOverflowing(element.scrollHeight > element.clientHeight);
  }, []);

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
    return {
      display: "-webkit-box",
      WebkitLineClamp: lines,
      WebkitBoxOrient: "vertical" as const,
    };
  };

  const handleToggle = () => {
    setIsExpanded((prev) => !prev);
  };

  // If text is not overflowing, just render the text without button
  if (!isOverflowing) {
    return (
      <Text
        ref={textRef}
        className={cn("overflow-hidden whitespace-pre-line", className)}
        style={getLineClampStyles(maxLines)}
        {...textProps}
      >
        {children}
      </Text>
    );
  }

  return (
    <div className="flex w-full min-w-0 flex-col items-start gap-1">
      <Text
        ref={textRef}
        className={cn("w-full overflow-hidden whitespace-pre-line", className)}
        style={isExpanded ? undefined : getLineClampStyles(maxLines)}
        {...textProps}
      >
        {children}
      </Text>
      <Button
        onClick={handleToggle}
        className="h-auto shrink-0 p-0 underline"
        variant="link"
        type="button"
        color="accent"
      >
        {isExpanded ? seeLessText : seeMoreText}
      </Button>
    </div>
  );
}

export { ExpandedText, type ExpandedTextProps };
