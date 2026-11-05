import { PaymentTopUpDialog } from "@/services/payment";
import type { ApiSchemas } from "@/shared/api/schema";
import { AiStarIcon } from "@/shared/assets/icons/outlined/AiStar";
import { cn } from "@/shared/lib/css";
import { Button } from "@/shared/ui/kit/button";
import { Card } from "@/shared/ui/kit/card";
import { Text } from "@/shared/ui/kit/text";

export function PaymentCredits({
  className,
  credits,
  ...props
}: React.ComponentProps<typeof Card> & {
  credits: ApiSchemas["OrganizationCreditsDto"];
}) {
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex items-center justify-between">
        <Text variant="h2">Total available credits</Text>
        <Text variant="title" className="flex items-center gap-0.5">
          {credits?.available?.toLocaleString()}
          <AiStarIcon />
        </Text>
      </div>

      <PaymentTopUpDialog
        trigger={<Button className="self-start">Add Credits</Button>}
      />
    </div>
  );
}
