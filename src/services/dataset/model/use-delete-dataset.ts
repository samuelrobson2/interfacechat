import { rqClient } from "@/shared/api/instance";
import { toast } from "@/shared/ui/kit/sonner-toast";

export function useDeleteDataset() {
  const { mutateAsync, isPending, error } = rqClient.useMutation(
    "delete",
    "/datasets/{dataset_id}",
  );

  const deleteDataset = async (
    dataset_id: string,
    onSuccess?: () => unknown | Promise<unknown>,
  ) => {
    await mutateAsync(
      {
        params: {
          path: {
            dataset_id,
          },
        },
      },
      {
        onSuccess: async () => {
          toast.success("Dataset was deleted successfully.");
          await onSuccess?.();
        },
        onError: (error) => {
          toast.error(error?.message?.toString() ?? "Failed to delete the dataset");
        },
      },
    );
  };

  return {
    deleteDataset,
    isPending,
    error,
  };
}
