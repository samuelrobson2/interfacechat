import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/kit/tabs";
import { Suspense } from "react";
import { useDatasetDataSuspense } from "../model/use-dataset-data-suspense";
import { useDatasetTabs } from "../model/use-dataset-tabs";
import { DatasetFailedView } from "../ui/dataset-failed-view";
import {
  DatasetCustomChartsSkeleton,
  DatasetFinetuneSkeleton,
  DatasetMeasureFinetuneMetricsSkeleton,
  DatasetMeasureSkeleton,
  DatasetShareSkeleton,
  DatasetViewSkeleton,
  DatasetApiSkeleton,
} from "../ui/dataset-tabs-skeleton";
import { DatasetApi } from "./dataset-api";
import { DatasetCustomCharts } from "./dataset-custom-charts";
import { DatasetFinetune } from "./dataset-finetune";
import { DatasetInfoCard } from "./dataset-info-card";
import { DatasetMeasure } from "./dataset-measure";
import { DatasetShare } from "./dataset-share";
import { DatasetView } from "./dataset-view";
import { Separator } from "@/shared/ui/kit/separator";
import { DatasetFinetuneMetrics } from "./dataset-finetune-metrics";
import { useIsMobile } from "@/shared/lib/react/use-mobile";
import { isChatVisualizeEnabled } from "@/shared/model/feature-flag";

export function DatasetTabs() {
  const { dataset, isFailed, failedErrorMessage, isPreprocessingFailed } =
    useDatasetDataSuspense();
  const { tab, handleTabChange } = useDatasetTabs();
  const isMobile = useIsMobile();

  if (isFailed) {
    return (
      <DatasetFailedView
        dataset_id={dataset.dataset_id}
        errorMessage="Oops! Processing Failed"
        errorDescription={failedErrorMessage}
        hideRetry={isPreprocessingFailed}
      />
    );
  }

  return (
    <Tabs
      className="w-full min-w-0 overflow-hidden gap-15"
      value={tab}
      onValueChange={handleTabChange}
    >
      <TabsList>
        <TabsTrigger value="measure">Measure</TabsTrigger>
        <TabsTrigger value="view" hidden={isMobile}>
          View
        </TabsTrigger>
        <TabsTrigger value="share">Share</TabsTrigger>
        <TabsTrigger value="finetune" hidden={isMobile}>
          AutoScientist
        </TabsTrigger>
        <TabsTrigger value="api" hidden={isMobile}>
          API
        </TabsTrigger>
      </TabsList>
      <TabsContent
        className="flex flex-col gap-[48px] overflow-x-hidden"
        value="measure"
      >
        <Suspense fallback={<DatasetMeasureSkeleton />}>
          <DatasetInfoCard />
          <DatasetMeasure />
          {isChatVisualizeEnabled() && (
            <Suspense fallback={<DatasetCustomChartsSkeleton />}>
              <DatasetCustomCharts />
            </Suspense>
          )}
          <Separator
            color="secondary"
            className="data-[orientation=horizontal]:h-[0.5px]"
          />
          <Suspense fallback={<DatasetMeasureFinetuneMetricsSkeleton />}>
            <DatasetFinetuneMetrics />
          </Suspense>
        </Suspense>
      </TabsContent>
      <TabsContent value="view">
        <Suspense fallback={<DatasetViewSkeleton />}>
          <DatasetView />
        </Suspense>
      </TabsContent>
      <TabsContent className="pb-8" value="share">
        <Suspense fallback={<DatasetShareSkeleton />}>
          <DatasetShare />
        </Suspense>
      </TabsContent>
      <TabsContent value="finetune">
        <Suspense fallback={<DatasetFinetuneSkeleton />}>
          <DatasetFinetune />
        </Suspense>
      </TabsContent>
      <TabsContent value="api">
        <Suspense fallback={<DatasetApiSkeleton />}>
          <DatasetApi key={dataset.dataset_id} />
        </Suspense>
      </TabsContent>
    </Tabs>
  );
}
