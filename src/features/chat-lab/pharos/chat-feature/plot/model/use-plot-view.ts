import { downloadChartCsv } from "../../../chat";
import { useChartDownload } from "@/shared/ui/kit/chart-download/chart-download";
import { useState } from "react";
import { dataColumns, plotFileBase, xColumnHeader } from "../lib/plot-data";
import type { PlotSpec } from "./plot-schema";

type PlotView = "chart" | "data";

/**
 * Owns the chart/data toggle and the context-aware export: a PNG snapshot of
 * the chart figure, or a CSV dump of the underlying data while in data view.
 */
export const usePlotView = (spec: PlotSpec) => {
  const {
    ref: figureRef,
    handleDownloadImage,
    isDownloading,
  } = useChartDownload(`${plotFileBase(spec)}.png`);
  const [view, setView] = useState<PlotView>("chart");
  const isDataView = view === "data";

  const toggleView = () =>
    setView((current) => (current === "chart" ? "data" : "chart"));

  const handleDownload = () =>
    isDataView
      ? downloadChartCsv(
          [{ key: "x", label: xColumnHeader(spec) }, ...dataColumns(spec)],
          spec.data,
          `${plotFileBase(spec)}.csv`,
        )
      : void handleDownloadImage();

  return { figureRef, isDataView, toggleView, isDownloading, handleDownload };
};
