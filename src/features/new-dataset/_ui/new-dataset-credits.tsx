import { CreditsValue } from "@/services/payment";
import { Badge } from "@/shared/ui/kit/badge";
import { Separator } from "@/shared/ui/kit/separator";
import { Text } from "@/shared/ui/kit/text";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/ui/kit/tooltip";

export function NewDatasetCredits({
  usersCredits,
  totalAmount,
}: {
  usersCredits: number;
  totalAmount: number;
}) {
  const isNotEnoughCredits = totalAmount > usersCredits;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge
          className="px-3 hover:bg-neutral-200 transition-colors"
          size="md"
        >
          <CreditsValue value={usersCredits} />
        </Badge>
      </TooltipTrigger>
      <TooltipContent
        className="p-6 flex flex-col gap-4 rounded-[24px] w-[340px]"
        side="bottom"
        align="end"
        sideOffset={10}
        showArrow={false}
      >
        <div className="flex justify-between">
          <Text variant="title">Total amount</Text>
          <CreditsValue value={totalAmount} />
        </div>

        {isNotEnoughCredits && (
          <>
            <Separator />

            <Text>
              You need {(totalAmount - usersCredits).toLocaleString()} more
              credits.
            </Text>
          </>
        )}
      </TooltipContent>
    </Tooltip>
  );
}
