import {
  captureElementAsFile,
  waitForFrames,
} from "@/shared/lib/html-to-image-webkit";
import { useState } from "react";
import { createRoot } from "react-dom/client";
import { DatasetMeasureTemplate } from "../compose/dataset-measure-template";
import type { DatasetMeasureData } from "./use-dataset-measure";

const captureCardAsFile = async (
  element: HTMLDivElement | null,
  fileName: string,
) => {
  if (!element) {
    throw new Error("Export card is not ready yet");
  }
  // Static template assets are same-origin — opt-in to `cacheBust` to defeat
  // the browser cache between repeated exports.
  return captureElementAsFile(element, fileName, { cacheBust: true });
};

const prepareExportFiles = async (
  measures: DatasetMeasureData,
  datasetName: string,
  useBanner: boolean,
  useCover: boolean,
) => {
  const host = document.createElement("div");
  // WebKit often rasterizes opacity:0 subtrees as empty; keep fully opaque and move off-screen.
  host.style.position = "fixed";
  host.style.left = "0";
  host.style.top = "0";
  host.style.transform = "translate(-100vw, 0)";
  host.style.opacity = "1";
  host.style.pointerEvents = "none";
  document.body.appendChild(host);
  const root = createRoot(host);

  try {
    root.render(
      <DatasetMeasureTemplate
        measures={measures}
        datasetName={datasetName}
        useBanner={useBanner}
        useCover={useCover}
      />,
    );
    await waitForFrames(4);

    const qualityGainCard = host.querySelector<HTMLDivElement>(
      "[data-export-card='quality_gain']",
    );
    const gradeCard = host.querySelector<HTMLDivElement>(
      "[data-export-card='grade']",
    );
    const percentileChartCard = host.querySelector<HTMLDivElement>(
      "[data-export-card='percentile_chart']",
    );

    let banner: File | undefined;
    if (useBanner) {
      const bannerCard = host.querySelector<HTMLDivElement>(
        "[data-export-card='banner']",
      );
      banner = await captureCardAsFile(bannerCard, "banner.png");
    }
    let cover: File | undefined;
    if (useCover) {
      const coverCard = host.querySelector<HTMLDivElement>(
        "[data-export-card='cover_image']",
      );
      cover = await captureCardAsFile(coverCard, "cover.png");
    }

    const qualityGain = await captureCardAsFile(
      qualityGainCard,
      "quality_gain.png",
    );
    const grade = await captureCardAsFile(gradeCard, "grade.png");
    const percentileChart = await captureCardAsFile(
      percentileChartCard,
      "percentile_chart.png",
    );

    return { banner, cover, qualityGain, grade, percentileChart };
  } finally {
    root.unmount();
    host.remove();
  }
};

export function useDatasetPrepareImages() {
  const [isPreparingExport, setIsPreparingExport] = useState(false);

  const exportImages = async (
    measures: DatasetMeasureData,
    datasetName: string,
    options?: { useBanner?: boolean; useCover?: boolean },
  ) => {
    setIsPreparingExport(true);
    try {
      return await prepareExportFiles(
        measures,
        datasetName?.replaceAll("_", " ").trim() || "Dataset",
        options?.useBanner ?? false,
        options?.useCover ?? false,
      );
    } finally {
      setIsPreparingExport(false);
    }
  };

  return {
    exportImages,
    isPreparingExport,
  };
}
