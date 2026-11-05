import { rqClient } from "@/shared/api/instance";
import { queryClient } from "@/shared/api/query-client";
import { toast } from "@/shared/ui/kit/sonner-toast";
import { useTransition } from "react";
import { paymentQueryOptions } from "./payment-query-options";

export function useSetPaymentMethod() {
  const [isPending, startTransition] = useTransition();
  const {
    mutateAsync: setPaymentMethodMutation,
    error: errorSetPaymentMethod,
  } = rqClient.useMutation("post", "/subscription/set-payment-method", {
    onError: (error) => toast.error(error.responseMessage || error.message),
  });
  const {
    mutateAsync: setPaymentMethodDefaultMutation,
    error: errorSetPaymentMethodDefault,
  } = rqClient.useMutation(
    "post",
    "/payment-methods/{paymentMethodId}/set-default",
    {
      onError: (error) => toast.error(error.responseMessage || error.message),
    },
  );

  const setPaymentMethod = async (
    paymentMethodId: string,
    subscriptionId?: string,
  ) => {
    startTransition(async () => {
      try {
        const promises = [
          setPaymentMethodDefaultMutation({
            params: {
              path: { paymentMethodId },
            },
          }),
        ];

        if (subscriptionId) {
          promises.push(
            setPaymentMethodMutation({
              body: {
                subscriptionId,
                paymentMethodId,
              },
            }),
          );
        }

        await Promise.all(promises);

        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: paymentQueryOptions.subscription().queryKey,
          }),
          queryClient.invalidateQueries({
            queryKey: paymentQueryOptions.paymentMethods().queryKey,
          }),
        ]);
      } catch (error) {
        console.error(error);
      }
    });
  };

  return {
    setPaymentMethod,
    isPending,
    error: errorSetPaymentMethod || errorSetPaymentMethodDefault,
  };
}
