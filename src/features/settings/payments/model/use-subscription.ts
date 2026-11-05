import {
  paymentQueryOptions,
  useCancelSubscription,
  useResumeSubscription,
} from "@/services/payment";
import { queryClient } from "@/shared/api/query-client";
import { useTransition } from "react";

export function useSubscription() {
  const [isPending, startTransition] = useTransition();
  const { resumeSubscription, error: errorResumingSubscription } =
    useResumeSubscription();
  const { cancelSubscription, error: errorCancellingSubscription } =
    useCancelSubscription();

  const toggleSubscription = async (isActive: boolean) => {
    startTransition(async () => {
      if (isActive) {
        await resumeSubscription();
      } else {
        await cancelSubscription();
      }
      await queryClient.invalidateQueries({
        queryKey: paymentQueryOptions.subscription().queryKey,
      });
    });
  };

  return {
    toggleSubscription,
    isPending,
    error: errorResumingSubscription || errorCancellingSubscription,
  };
}
