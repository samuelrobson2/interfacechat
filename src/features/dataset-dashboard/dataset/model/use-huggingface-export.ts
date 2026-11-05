import { rqClient } from "@/shared/api/instance";
import type { DatasetRoutes, PathParams } from "@/shared/model/routes";
import { toast } from "@/shared/ui/kit/sonner-toast";
import { useParams } from "react-router-dom";
import { useDatasetMeasure } from "./use-dataset-measure";
import { useDatasetPrepareImages } from "./use-dataset-prepare-images";
import { useDatasetCache } from "@/services/dataset";

type HuggingFaceExportFiles = {
  banner: File;
  qualityGain: File;
  grade: File;
  percentileChart: File;
};

export function useHuggingfaceExport() {
  const measures = useDatasetMeasure();
  const dataset = useDatasetCache();

  const { dataset_id } = useParams<PathParams[DatasetRoutes]>();

  const { exportImages, isPreparingExport } = useDatasetPrepareImages();

  const { mutate, error, isPending } = rqClient.useMutation(
    "post",
    "/datasets/{dataset_id}/upload/huggingface",
  );

  const exportDataset = (
    datasetId: string,
    files: HuggingFaceExportFiles,
    isPrivate: boolean,
  ) => {
    mutate(
      {
        body: {
          banner: files.banner as unknown as string,
          quality_gain: files.qualityGain as unknown as string,
          grade: files.grade as unknown as string,
          percentile_chart: files.percentileChart as unknown as string,
          isPrivate,
        },
        params: {
          path: {
            dataset_id: datasetId,
          },
        },
        bodySerializer: () => {
          const formData = new FormData();
          formData.append("banner", files.banner, "banner.png");
          formData.append("quality_gain", files.qualityGain, "quality_gain.png");
          formData.append("grade", files.grade, "grade.png");
          formData.append(
            "percentile_chart",
            files.percentileChart,
            "percentile_chart.png",
          );
          formData.append("isPrivate", String(isPrivate));
          return formData;
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

  const handleHuggingfaceExport = async (isPrivate: boolean) => {
    if (!measures) {
      toast.info(
        "Data is being processed. Please wait while we process the data.",
      );
      return;
    }

    const { banner, qualityGain, grade, percentileChart } =
      await exportImages(measures, dataset?.name ?? "", { useBanner: true });
    if (!banner) {
      toast.error("Failed to prepare Hugging Face banner");
      return;
    }
    exportDataset(
      dataset_id!,
      { banner, qualityGain, grade, percentileChart },
      isPrivate,
    );
  };

  return {
    handleHuggingfaceExport,
    error: error?.message.toString(),
    isPending: isPending || isPreparingExport,
  };
}
