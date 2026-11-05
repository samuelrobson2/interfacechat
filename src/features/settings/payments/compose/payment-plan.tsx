import { useSubscriptionData } from "@/services/payment";
import type { ApiSchemas } from "@/shared/api/schema";
import { ArrowRightIcon } from "@/shared/assets/icons/outlined/ArrowRight";
import { cn } from "@/shared/lib/css";
import { useOptionsMap } from "@/shared/lib/react/use-options-map";
import { ROUTES } from "@/shared/model/routes";
import { Button } from "@/shared/ui/kit/button";
import { Label } from "@/shared/ui/kit/label";
import { Switch } from "@/shared/ui/kit/switch";
import { Text } from "@/shared/ui/kit/text";
import { Link } from "react-router-dom";
import { PLAN_IMAGES, type PaymentPlanType } from "@/services/plans";
import { useSubscription } from "../model/use-subscription";

const ViewPlansButton = ({ className }: { className?: string }) => (
  <Button className={cn("justify-start", className)} variant="link" asChild>
    <Link to={ROUTES.PLANS}>
      View plans
      <ArrowRightIcon pathClasses="stroke-current" />
    </Link>
  </Button>
);
export function PaymentPlan({
  className,
  subscriptions,
  activeGrantedPlan,
  plans,
  ...props
}: React.ComponentProps<"div"> & {
  subscriptions: ApiSchemas["SubscriptionListResponseDto"];
  activeGrantedPlan: ApiSchemas["ActiveGrantedPlanResponseDto"];
  plans: ApiSchemas["BillingPlanDto"][];
}) {
  const { toggleSubscription, isPending } = useSubscription();
  const {
    pendingPlanId,
    autoRenew,
    isFreePlan,
    planName,
    currentPeriodEnd,
    isGrantedPlan,
  } = useSubscriptionData(subscriptions, activeGrantedPlan);
  const plansMap = useOptionsMap(plans, "id");

  const planImage = PLAN_IMAGES[planName as PaymentPlanType];
  const renewDate = new Date(currentPeriodEnd ?? "").toLocaleDateString(
    "en-US",
    {
      month: "long",
      day: "numeric",
      year: "numeric",
    },
  );
  const renewText = pendingPlanId
    ? `Your subscription will change to ${plansMap[pendingPlanId as PaymentPlanType]?.name} on ${renewDate}`
    : `Renews ${renewDate}`;

  return (
    <div
      className={cn(
        "flex items-start gap-6",
        isPending && "opacity-50",
        className,
      )}
      {...props}
    >
      <img src={planImage.image} alt={planImage.alt} />

      <div className="flex flex-col items-start">
        <Text variant="h2">{`You’re on ${planName} plan`}</Text>
        {isGrantedPlan && (
          <Text className="mt-2" color="secondary">
            {`This is a granted plan until ${renewDate}`}
          </Text>
        )}
        {!isFreePlan && !isGrantedPlan && (
          <Text className="mt-2" color="secondary">
            {renewText}
          </Text>
        )}
        {isFreePlan || isGrantedPlan ? (
          <ViewPlansButton className="mt-4" />
        ) : (
          <Label className="gap-4 mt-4" htmlFor="prompt-switch">
            <Switch
              id="prompt-switch"
              disabled={isPending}
              checked={autoRenew ?? false}
              onCheckedChange={(checked) => toggleSubscription(checked)}
            />
            Automatically renew
          </Label>
        )}
      </div>
      {!isFreePlan && !isGrantedPlan && <ViewPlansButton className="mt-2" />}
    </div>
  );
}
