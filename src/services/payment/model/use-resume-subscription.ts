import { useSessionStore } from "@/services/auth";
import { rqClient } from "@/shared/api/instance";
import { toast } from "@/shared/ui/kit/sonner-toast";

export function useResumeSubscription() {
  const user = useSessionStore((state) => state.user);
  const { mutateAsync, isPending, error } = rqClient.useMutation(
    "post",
    "/subscription/resume",
  );

  const resumeSubscription = async () => {
    try {
      await mutateAsync(
        {
          body: {
            organizationId: user?.organizations[0]?.organization_id ?? "",
          },
        },
        {
          onError: (error) => toast.error(error.responseMessage || error.message),
        },
      );
    } catch (error) {
      console.error(error);
    }
  };

  return {
    resumeSubscription,
    isPending,
    error: error?.message?.toString(),
  };
}
