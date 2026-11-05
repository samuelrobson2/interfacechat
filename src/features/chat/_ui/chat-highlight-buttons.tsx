import { ChatPillButton } from "@/services/chat";
import { HighlightIcon } from "@/shared/assets/icons/general/Highlight";
import { CrossLargeIcon } from "@/shared/assets/icons/outlined/CrossLarge";
import { cn } from "@/shared/lib/css";
import { Button } from "@/shared/ui/kit/button";
import { Text } from "@/shared/ui/kit/text";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/ui/kit/tooltip";

export function ChatAssistantHighlightIndicator({
  active,
  ...props
}: React.ComponentProps<typeof ChatPillButton> & { active: boolean }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <ChatPillButton
          shape="pill-text"
          active={active}
          className={cn("gap-1.5")}
          {...props}
        >
          <HighlightIcon svgClasses="size-4" />
          <Text variant="label" color="primary">
            Highlight
          </Text>
        </ChatPillButton>
      </TooltipTrigger>
      <TooltipContent className="max-w-[320px]">
        {active ? "Disable highlight mode" : "Enable highlight mode"}
      </TooltipContent>
    </Tooltip>
  );
}

export function ChatAssistantClearSelectionButton({
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon-md"
          data-slot="clear-selection-btn"
          {...props}
        >
          <CrossLargeIcon svgClasses="size-6" />
        </Button>
      </TooltipTrigger>
      <TooltipContent className="max-w-[320px]">Clear selection</TooltipContent>
    </Tooltip>
  );
}
