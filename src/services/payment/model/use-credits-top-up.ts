import { useSessionStore } from "@/services/auth";
import { rqClient } from "@/shared/api/instance";
import { toast } from "@/shared/ui/kit/sonner-toast";

export function useCreditsTopUp() {
  const user = useSessionStore((state) => state.user);
  const { mutateAsync, isPending, error } = rqClient.useMutation(
    "post",
    "/billing/topup",
    {
      onError: (error) => toast.error(error.responseMessage || error.message),
    },
  );

  const topUpCredits = async (amount: number) => {
    try {
      const queryParamsSuccess = new URLSearchParams(window.location.search);
      queryParamsSuccess.set("checkout_success", "true");
      const urlSuccess = `${window.location.pathname}?${queryParamsSuccess.toString()}`;

      const queryParamsCancel = new URLSearchParams(window.location.search);
      queryParamsCancel.set("checkout_success", "false");
      const urlCancel = `${window.location.pathname}?${queryParamsCancel.toString()}`;

      const response = await mutateAsync({
        body: {
          credits: amount,
          organizationId: user?.organizations[0]?.organization_id ?? "",
          successUrl: urlSuccess,
          cancelUrl: urlCancel,
        },
      });

      if (response?.checkoutUrl) {
        window.location.href = response.checkoutUrl;
      }
    } catch (error) {
      console.error(error);
    }
  };

  return {
    topUpCredits,
    isPending,
    error: error?.message?.toString(),
  };
}
