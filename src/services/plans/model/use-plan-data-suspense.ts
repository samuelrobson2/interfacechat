import { paymentQueryOptions, useSubscriptionData } from "@/services/payment";
import type { ApiSchemas } from "@/shared/api/schema";
import { useSuspenseQueries } from "@tanstack/react-query";
import { useMemo } from "react";

export interface PlanFeature {
  text: string;
  subItems?: string[];
}

export interface SettingPlan {
  id: string;
  title: string;
  features: ApiSchemas["PlanFeatureDto"][];
  planAction?: ApiSchemas["BillingPlanDto"]["action"];
  priceCents: number;
  period: string;
  actionText: string | null;
  mostPopular?: boolean;
  isCurrentPlan?: boolean;
  hideButton?: boolean;
}

function getActionText(
  isCurrentPlan: boolean,
  planIndex: number,
  currentPlanIndex: number,
  pendingPlanId?: string | null,
  currentPeriodEnd?: string,
) {
  if (!isCurrentPlan) {
    return planIndex < currentPlanIndex ? "Downgrade" : "Upgrade";
  }

  if (pendingPlanId)
    return `Starts on ${new Date(currentPeriodEnd ?? "").toLocaleDateString(
      "en-US",
      {
        month: "long",
        day: "numeric",
        year: "numeric",
      },
    )}`;

  return "Current plan";
}

export function usePlanDataSuspense() {
  const [
    { data: plansData, isFetching: isPlansFetching },
    { data: activeGrantedPlan },
    { data: subscriptionData, isFetching: isSubscriptionFetching },
  ] = useSuspenseQueries({
    queries: [
      paymentQueryOptions.billingPlans(),
      paymentQueryOptions.activeGrantedPlan(),
      {
        ...paymentQueryOptions.subscription(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        refetchInterval: (query: any) => {
          const data = query.state
            .data as ApiSchemas["SubscriptionListResponseDto"];
          return data?.[0]?.pending_upgrade_plan_id ? 1000 : false;
        },
      },
    ],
  });
  const { pendingPlanId, planName, currentPeriodEnd } = useSubscriptionData(
    subscriptionData,
    activeGrantedPlan,
  );

  const currentPlanName = pendingPlanId
    ? plansData?.find((plan) => plan.id === pendingPlanId)?.name
    : planName;

  const currentPlanIndex = plansData.findIndex(
    (plan) => plan.name === currentPlanName,
  );

  const plans = useMemo<SettingPlan[]>(
    () =>
      plansData
        ?.sort((a, b) => a.sort_order - b.sort_order)
        .map((plan, planIndex) => {
          const isCurrentPlan = currentPlanName === plan.name;
          const hideButton = plan.name === "Free" && !isCurrentPlan;

          return {
            id: plan.id,
            title: plan.name,
            features: plan.description.features,
            priceCents: plan.price_cents ?? 0,
            period: "per month",
            actionText: getActionText(
              isCurrentPlan,
              planIndex,
              currentPlanIndex,
              pendingPlanId,
              currentPeriodEnd,
            ),
            mostPopular: plan.is_popular,
            isCurrentPlan: isCurrentPlan,
            planAction: plan.action,
            hideButton,
          };
        }),
    [
      plansData,
      currentPlanName,
      currentPlanIndex,
      pendingPlanId,
      currentPeriodEnd,
    ],
  );

  return {
    plans,
    isFetching: isPlansFetching || isSubscriptionFetching,
  };
}
