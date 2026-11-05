import { useSessionStore } from "@/services/auth";
import { rqClient } from "@/shared/api/instance";
import { queryClient } from "@/shared/api/query-client";
import { toast } from "@/shared/ui/kit/sonner-toast";
import { useTransition } from "react";
import { paymentQueryOptions } from "./payment-query-options";

export function useChangePlan() {
  const [isPending, startTransition] = useTransition();

  const user = useSessionStore((state) => state.user);

  const { mutateAsync: startPlanMutation, error: errorStartingPlan } =
    rqClient.useMutation("post", "/billing/start", {
      onError: (error) => toast.error(error?.responseMessage || error?.message),
    });
  const { mutateAsync: changePlanMutation, error: errorChangingPlan } =
    rqClient.useMutation("post", "/subscription/change-plan", {
      onError: (error) => toast.error(error?.responseMessage || error?.message),
    });

  const organizationId = user?.organizations[0]?.organization_id ?? "";

  const startPlanTransition = (planId: string) => {
    startTransition(async () => {
      try {
        const queryParamsSuccess = new URLSearchParams();
        queryParamsSuccess.set("checkout_success", "true");
        const urlSuccess = `${window.location.pathname}?${queryParamsSuccess.toString()}`;

        const queryParamsCancel = new URLSearchParams();
        queryParamsCancel.set("checkout_success", "false");
        const urlCancel = `${window.location.pathname}?${queryParamsCancel.toString()}`;

        const response = await startPlanMutation({
          body: {
            plan: planId,
            organizationId,
            interval: "month",
            successUrl: urlSuccess,
            cancelUrl: urlCancel,
          },
        });

        if (response?.checkoutUrl) {
          window.location.href = response.checkoutUrl;
        }
        return;
      } catch (error) {
        console.error(error);
      }
    });
  };

  const changePlanTransition = (planId: string) => {
    startTransition(async () => {
      try {
        await changePlanMutation({
          body: {
            newPlanId: planId as "plus" | "pro",
            organizationId,
          },
        });
        await queryClient.invalidateQueries({
          queryKey: paymentQueryOptions.subscription().queryKey,
        });
      } catch (error) {
        console.error(error);
      }
    });
  };

  const changePlan = (isStartPlan: boolean, newPlanId: string) => {
    if (isStartPlan) {
      startPlanTransition(newPlanId);
    } else {
      changePlanTransition(newPlanId);
    }
  };

  return {
    changePlan,
    isPending,
    error:
      errorStartingPlan?.message?.toString() ||
      errorChangingPlan?.message?.toString(),
  };
}
