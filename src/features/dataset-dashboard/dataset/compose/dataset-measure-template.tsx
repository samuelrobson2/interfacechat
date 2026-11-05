import gradeImage from "@/shared/assets/images/dataset-grade.png";
import percentileImage from "@/shared/assets/images/percentile.png";
import adaptionLogo from "@/shared/assets/images/adaption-logo.png";
import kaggleBanner1 from "@/shared/assets/images/kaggle-banners/kaggte-banner-1.jpg";
import kaggleBanner2 from "@/shared/assets/images/kaggle-banners/kaggte-banner-2.jpg";
import kaggleBanner3 from "@/shared/assets/images/kaggle-banners/kaggte-banner-3.jpg";
import kaggleBanner4 from "@/shared/assets/images/kaggle-banners/kaggte-banner-4.jpg";
import kaggleCover1 from "@/shared/assets/images/kaggle-covers/kaggte-cover-1.jpg";
import kaggleCover2 from "@/shared/assets/images/kaggle-covers/kaggte-cover-2.jpg";
import kaggleCover3 from "@/shared/assets/images/kaggle-covers/kaggte-cover-3.jpg";
import kaggleCover4 from "@/shared/assets/images/kaggle-covers/kaggte-cover-4.jpg";
import { DatasetChart } from "../ui/dataset-chart";
import { DatasetChartCard } from "../ui/dataset-chart-card";
import { DatasetChartLegend } from "../ui/dataset-chart-legend";
import {
  DatasetQualityCard,
  DatasetQualityCardContent,
  DatasetQualityCardItem,
} from "../ui/dataset-quality-card";
import type { DatasetMeasureData } from "../model/use-dataset-measure";
import { truncateDatasetBannerName } from "@/shared/lib/truncate-dataset-banner-name";
import { Text } from "@/shared/ui/kit/text";
import { useMemo } from "react";

const KAGGLE_BANNERS = [
  kaggleBanner1,
  kaggleBanner2,
  kaggleBanner3,
  kaggleBanner4,
];

const KAGGLE_COVERS = [kaggleCover1, kaggleCover2, kaggleCover3, kaggleCover4];

function pickRandomBanner(): string {
  const i = Math.floor(Math.random() * KAGGLE_BANNERS.length);
  return KAGGLE_BANNERS[i] ?? kaggleBanner1;
}

function pickRandomCover(): string {
  const i = Math.floor(Math.random() * KAGGLE_COVERS.length);
  return KAGGLE_COVERS[i] ?? kaggleCover1;
}

export function DatasetMeasureTemplate({
  measures,
  datasetName,
  useBanner = false,
  useCover = false,
}: {
  measures: DatasetMeasureData;
  datasetName: string;
  useBanner?: boolean;
  useCover?: boolean;
}) {
  const bannerSrc = useMemo(() => {
    if (!useBanner) return null;
    return pickRandomBanner();
  }, [useBanner]);

  const coverSrc = useMemo(() => {
    if (!useCover) return null;
    return pickRandomCover();
  }, [useCover]);

  return (
    <div className="flex flex-col gap-8">
      {bannerSrc ? (
        <div
          data-export-card="banner"
          className="relative h-[250px] w-full shrink-0 overflow-hidden rounded-[8px] border border-border-secondary"
        >
          <img
            src={bannerSrc}
            alt=""
            className="absolute inset-0 block h-full w-full object-cover"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-22 py-10">
            <Text
              variant="h1"
              className="max-w-full text-center break-words"
              color="darkGray"
              title={datasetName}
            >
              {truncateDatasetBannerName(datasetName)}
            </Text>
            <div className="flex w-full justify-center">
              <img
                src={adaptionLogo}
                alt="adaption"
                className="h-[58px] w-auto"
              />
            </div>
          </div>
        </div>
      ) : null}

      {coverSrc ? (
        <div
          data-export-card="cover_image"
          className="relative w-[280px] h-[140px]"
        >
          <img
            src={coverSrc}
            alt=""
            className="absolute inset-0 block w-[280px] h-[140px]"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-12 py-12">
            <Text
              variant="title"
              className="max-w-full text-center break-words"
              color="darkGray"
              title={datasetName}
            >
              {truncateDatasetBannerName(datasetName)}
            </Text>
            <div className="flex w-full justify-center">
              <img
                src={adaptionLogo}
                alt="adaption"
                className="h-[30px] w-auto"
              />
            </div>
          </div>
        </div>
      ) : null}

      <div
        data-export-card="quality_gain"
        className="w-[520px] rounded-[8px] border border-border-secondary bg-background-primary p-8"
      >
        <DatasetChartCard title="Quality" improvementPercent={measures.gains}>
          <DatasetChartLegend chartData={measures.qualityChartData} />
          <DatasetChart
            chartData={measures.qualityChartData}
            isAnimationActive={false}
          />
        </DatasetChartCard>
        <div className="mt-6 flex items-end justify-end gap-2">
          <img src={adaptionLogo} alt="adaption" className="h-12 w-auto" />
        </div>
      </div>

      <div
        data-export-card="grade"
        className="w-[520px] rounded-[8px] border border-border-secondary bg-background-primary p-8"
      >
        <DatasetQualityCard icon={<img src={gradeImage} alt="grade" />}>
          <DatasetQualityCardContent title="Grade" contentClassName="gap-19">
            <DatasetQualityCardItem
              title="Before"
              value={measures.grade_before}
            />
            <DatasetQualityCardItem
              title="After"
              value={measures.grade_after}
            />
          </DatasetQualityCardContent>
        </DatasetQualityCard>
        <div className="mt-6 flex items-end justify-end gap-2">
          <img src={adaptionLogo} alt="adaption" className="h-12 w-auto" />
        </div>
      </div>

      <div
        data-export-card="percentile_chart"
        className="w-[520px] rounded-[8px] border border-border-secondary bg-background-primary p-8"
      >
        <DatasetQualityCard
          icon={<img src={percentileImage} alt="percentile" />}
        >
          <DatasetQualityCardContent
            title="Percentile"
            contentClassName="gap-19"
          >
            <DatasetQualityCardItem
              title="Before"
              value={measures.percentile_before}
            />
            <DatasetQualityCardItem
              title="After"
              value={measures.percentile_after}
            />
          </DatasetQualityCardContent>
        </DatasetQualityCard>
        <div className="mt-6 flex items-end justify-end gap-2">
          <img src={adaptionLogo} alt="adaption" className="h-12 w-auto" />
        </div>
      </div>
    </div>
  );
}
