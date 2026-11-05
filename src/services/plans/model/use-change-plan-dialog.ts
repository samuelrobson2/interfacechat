import {
  paymentQueryOptions,
  useChangePlan,
  useSubscriptionData,
} from "@/services/payment";
import { queryClient } from "@/shared/api/query-client";
import type { ApiSchemas } from "@/shared/api/schema";
import { useState } from "react";
import type { SettingPlan } from "./use-plan-data-suspense";

export interface UpgradePlanState {
  planId: string;
  planName: string;
  upgradeAmount: string;
}

export interface DowngradePlanState {
  planId: string;
  planName: string;
  activeUntilDate?: string;
  nextChargeAmount?: string;
}

const PLAN_ORDER = ["Free", "Plus", "Pro"] as const;

const getPlanRank = (planTitle: string) =>
  PLAN_ORDER.indexOf(planTitle as (typeof PLAN_ORDER)[number]);

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

const formatPrice = (priceCents: number): string =>
  `$${(priceCents / 100).toFixed(0)}`;

export function useChangePlanDialog({
  plans,
}: {
  plans: SettingPlan[] | undefined;
}) {
  const subscriptionData = queryClient.getQueryData<
    ApiSchemas["SubscriptionListResponseDto"]
  >(paymentQueryOptions.subscription().queryKey);
  const activeGrantedPlan = queryClient.getQueryData<
    ApiSchemas["ActiveGrantedPlanResponseDto"]
  >(paymentQueryOptions.activeGrantedPlan().queryKey);

  const {
    isFreePlan,
    pendingPlanId,
    planId: currentPlanId,
    currentPeriodEnd,
    isGrantedPlan,
  } = useSubscriptionData(subscriptionData, activeGrantedPlan);

  const { changePlan, isPending } = useChangePlan();

  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [upgradePlan, setUpgradePlan] = useState<UpgradePlanState | null>(null);
  const [downgradePlan, setDowngradePlan] = useState<DowngradePlanState | null>(
    null,
  );

  const currentPlan = plans?.find((p) => p.isCurrentPlan);

  const handlePlanClick = (planId: string) => {
    setSelectedPlanId(planId);

    if (
      isFreePlan ||
      isGrantedPlan ||
      (pendingPlanId && currentPlanId === planId)
    )
      return changePlan(isFreePlan || isGrantedPlan, planId);

    const selectedPlan = plans?.find((p) => p.id === planId);
    if (!selectedPlan) return;

    const currentRank = getPlanRank(currentPlan?.title ?? "");
    const selectedRank = getPlanRank(selectedPlan.title);
    const isUpgrade = selectedRank > currentRank;

    if (isUpgrade) {
      setUpgradePlan({
        planId,
        planName: selectedPlan.title,
        upgradeAmount: currentPlan
          ? formatPrice(selectedPlan.priceCents - currentPlan.priceCents)
          : formatPrice(selectedPlan.priceCents),
      });
    } else {
      setDowngradePlan({
        planId,
        planName: selectedPlan.title,
        activeUntilDate: currentPeriodEnd
          ? formatDate(currentPeriodEnd)
          : undefined,
        nextChargeAmount: formatPrice(selectedPlan.priceCents),
      });
    }
  };

  const handleConfirmUpgrade = () => {
    if (!upgradePlan) return;
    changePlan(isFreePlan, upgradePlan.planId);
    setUpgradePlan(null);
  };

  const handleConfirmDowngrade = () => {
    if (!downgradePlan) return;
    changePlan(isFreePlan, downgradePlan.planId);
    setDowngradePlan(null);
  };

  const handleCloseUpgrade = () => {
    setUpgradePlan(null);
    setSelectedPlanId(null);
  };

  const handleCloseDowngrade = () => {
    setDowngradePlan(null);
    setSelectedPlanId(null);
  };

  return {
    selectedPlanId,
    upgradePlan,
    downgradePlan,
    isPending,
    handlePlanClick,
    handleConfirmUpgrade,
    handleConfirmDowngrade,
    handleCloseUpgrade,
    handleCloseDowngrade,
  };
}
