import { CircleCheckIcon } from "@/shared/assets/icons/general/CircleCheck";
import { cn } from "@/shared/lib/css";
import { Badge } from "@/shared/ui/kit/badge";
import { Card } from "@/shared/ui/kit/card";
import { Separator } from "@/shared/ui/kit/separator";
import { Text } from "@/shared/ui/kit/text";
import type { SettingPlan } from "../model/use-plan-data-suspense";

export function PlanItem({
  planImage,
  title,
  features,
  period,
  planAction,
  mostPopular,
  priceCents,
  className,
  action,
  ...props
}: React.ComponentProps<typeof Card> &
  Omit<SettingPlan, "hideButton" | "isCurrentPlan" | "actionText"> & {
    action?: React.ReactNode;
    planImage: React.ReactNode;
  }) {
  const priceFormatted =
    priceCents === 0 ? "$0" : `$${(priceCents / 100).toFixed(0)}`;

  return (
    <Card
      className={cn(
        "p-6 gap-8",
        mostPopular !== true && "[--hairline-color:transparent] shadow-none",
        className,
      )}
      {...props}
    >
      {planImage}

      <div className="flex flex-col gap-10 justify-between h-full">
        <div className="flex flex-col gap-6 w-full">
          <div className="flex gap-2 items-center">
            <Text variant="h2">{title}</Text>
            {mostPopular && (
              <Badge className="px-3 py-1 shadow-highlight-blue" size="md">
                Most Popular
              </Badge>
            )}
          </div>

          <div className="flex flex-col gap-4">
            {features.map((feature, index) => (
              <div key={index} className="flex flex-col gap-1.5">
                <div className="flex gap-2 items-start">
                  <CircleCheckIcon className="shrink-0" />
                  <Text>{feature.name}</Text>
                </div>
                {feature.subfeatures && (
                  <ul className="pl-14 list-disc space-y-0">
                    {feature.subfeatures.map((subfeature) => (
                      <li key={subfeature.name}>
                        <Text>{subfeature.name}</Text>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-6 w-full">
          {planAction !== "contact" && (
            <>
              <Separator color="secondary" />

              <div className="flex gap-2 items-center">
                <Text variant="h1">{priceFormatted}</Text>
                <Text color="secondary">{period}</Text>
              </div>
            </>
          )}

          {action}
        </div>
      </div>
    </Card>
  );
}
