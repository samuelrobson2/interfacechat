import type { ApiSchemas } from "@/shared/api/schema";

export function useSubscriptionData(
  subscriptions: ApiSchemas["SubscriptionListResponseDto"] | undefined,
  activeGrantedPlan: ApiSchemas["ActiveGrantedPlanResponseDto"] | undefined,
) {
  const grantedPlan = activeGrantedPlan?.granted_plan;
  const subscription = subscriptions?.[0];

  const isGrantedPlan = !subscription && !!grantedPlan;
  const planId = subscription?.plan.id || grantedPlan?.plan?.id;
  const planName = subscription?.plan.name || grantedPlan?.plan?.name || "Free";
  const currentPeriodEnd = subscription?.current_period_end || grantedPlan?.granted_until;
  const isFreePlan = planName === "Free";

  const checkAccess = (
    required_plans: ApiSchemas["Field"]["required_plans"],
  ) => {
    return (
      required_plans?.some((p) => p.plan_id === planId) ?? false
    );
  };

  return {
    checkAccess,
    planId,
    subscriptionId: subscription?.id,
    currentPeriodEnd,
    pendingPlanId: subscription?.pending_plan_id,
    pendingUpgradePlanId: subscription?.pending_upgrade_plan_id,
    autoRenew: subscription?.auto_renew,
    defaultPaymentMethodId: subscription?.default_payment_method_id,
    isFreePlan,
    isGrantedPlan,
    planName,
  };
}
