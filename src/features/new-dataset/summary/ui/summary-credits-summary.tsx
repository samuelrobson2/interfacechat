import { AiStarIcon } from "@/shared/assets/icons/outlined/AiStar";
import { cn } from "@/shared/lib/css";
import { Card } from "@/shared/ui/kit/card";
import { Text } from "@/shared/ui/kit/text";

function InfoItem({ title, value }: { title: string; value: string }) {
  return (
    <div className="flex justify-between items-center gap-2">
      <Text className="text-[18px] leading-[28px] font-normal">{title}</Text>
      <Text className="flex items-center gap-0.5" color="secondary">
        {value} <AiStarIcon pathClasses="bg-gradient-black-blue" />
      </Text>
    </div>
  );
}

export function SummaryCreditsSummary({
  totalCredits,
  datasetCost,
  className,
  ...props
}: React.ComponentProps<typeof Card> & {
  totalCredits: number;
  datasetCost: number;
}) {
  const showRemainingCredits = datasetCost > totalCredits;
  const remainingCredits = datasetCost - totalCredits;

  return (
    <Card className={cn("p-8 rounded-[8px] [--hairline-radius:8px]", className)} {...props}>
      <Text variant="title">Credit Summary</Text>

      <div className="flex flex-col gap-3">
        <InfoItem
          title="Current Balance:"
          value={`${totalCredits.toLocaleString()} Credits`}
        />
        <InfoItem
          title="Dataset Cost:"
          value={`${datasetCost.toLocaleString()} Credits`}
        />
        {showRemainingCredits && (
          <InfoItem
            title="Required to purchase:"
            value={`${remainingCredits.toLocaleString()} Credits`}
          />
        )}
      </div>
    </Card>
  );
}
