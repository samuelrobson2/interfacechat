import { useDatasetCache } from "@/services/dataset";
import { rqClient } from "@/shared/api/instance";
import type { DatasetRoutes, PathParams } from "@/shared/model/routes";
import { toast } from "@/shared/ui/kit/sonner-toast";
import { useParams } from "react-router-dom";
import { useDatasetMeasure } from "./use-dataset-measure";
import { useDatasetPrepareImages } from "./use-dataset-prepare-images";

type KaggleExportFiles = {
  banner: File;
  coverImage: File;
  qualityGain: File;
  grade: File;
  percentileChart: File;
};

export function useKaggleExport() {
  const measures = useDatasetMeasure();
  const dataset = useDatasetCache();
  const { dataset_id } = useParams<PathParams[DatasetRoutes]>();
  const { exportImages, isPreparingExport } = useDatasetPrepareImages();

  const { mutate, error, isPending } = rqClient.useMutation(
    "post",
    "/datasets/{dataset_id}/upload/kaggle",
  );

  const exportDataset = (
    datasetId: string,
    files: KaggleExportFiles,
    isPrivate: boolean,
  ) => {
    mutate(
      {
        body: {
          quality_gain: String(files.qualityGain),
          grade: String(files.grade),
          cover_image: String(files.coverImage),
          isPrivate: isPrivate,
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
          formData.append("cover_image", files.coverImage, "cover_image.png");
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

  const exportKaggleDataset = async (isPrivate: boolean) => {
    if (!measures) {
      toast.info(
        "Data is being processed. Please wait while we process the data.",
      );
      return;
    }

    const { banner, cover, qualityGain, grade, percentileChart } =
      await exportImages(measures, dataset?.name ?? "", { useBanner: true, useCover: true });
    if (!banner) {
      toast.error("Failed to prepare Kaggle banner");
      return;
    }
    if (!cover) {
      toast.error("Failed to prepare Kaggle cover image");
      return;
    }
    exportDataset(
      dataset_id!,
      { banner, coverImage: cover, qualityGain, grade, percentileChart },
      isPrivate,
    );
  };

  return {
    exportKaggleDataset,
    error: error?.message.toString(),
    isPending: isPending || isPreparingExport,
  };
}
