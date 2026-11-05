import { rqClient } from "@/shared/api/instance";
import type { DatasetRoutes, PathParams } from "@/shared/model/routes";
import { toast } from "@/shared/ui/kit/sonner-toast";
import { useParams } from "react-router-dom";

export function useGoogleSheetsExport() {
  const { dataset_id } = useParams<PathParams[DatasetRoutes]>();
  const { mutate, error, isPending } = rqClient.useMutation(
    "post",
    "/datasets/{dataset_id}/upload/google-sheets"
  );

  const handleGoogleSheetsExport = (isPrivate: boolean) => {
    mutate(
      {
        body: {
          isPrivate,
        },
        params: {
          path: {
            dataset_id: dataset_id!,
          },
        },
      },
      {
        onSuccess: () => {
          toast.success(
            "Export successfully started. We are working on publishing, expect an email once it is done.",
          );
        },
        onError: (error) => {
          toast.error(error?.message?.toString() ?? "Failed to export dataset");
        },
      },
    );
  };

  return {
    handleGoogleSheetsExport,
    error: error?.message.toString(),
    isPending: isPending,
  };
}
