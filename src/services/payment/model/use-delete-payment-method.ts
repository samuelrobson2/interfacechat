import { rqClient } from "@/shared/api/instance";
import { queryClient } from "@/shared/api/query-client";
import { toast } from "@/shared/ui/kit/sonner-toast";
import { useTransition } from "react";
import { paymentQueryOptions } from "./payment-query-options";

export function useDeletePaymentMethod() {
  const [isPending, startTransition] = useTransition();
  const {
    mutateAsync: deletePaymentMethodMutation,
    error: errorDeletePaymentMethod,
  } = rqClient.useMutation("delete", "/payment-methods/{paymentMethodId}", {
    onError: (error) => toast.error(error.responseMessage || error.message),
  });

  const deletePaymentMethod = async (paymentMethodId: string) => {
    startTransition(async () => {
      try {
        await deletePaymentMethodMutation({
          params: {
            path: { paymentMethodId },
          },
        });
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

  return { deletePaymentMethod, isPending, error: errorDeletePaymentMethod };
}
