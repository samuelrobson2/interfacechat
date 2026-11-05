import {
  ChildPageHeader,
  ChildPageLayout,
  ChildPageTitleSkeleton,
} from "@/shared/ui/child-page-layout";
import { Suspense } from "react";
import { DEMO_MODE, DEV_AUTH_BYPASS } from "@/shared/model/dev-auth-bypass";
import { DatasetDashboardTitle } from "./compose/dataset-dashboard-title";
import { DatasetTabs } from "./compose/dataset-tabs";
import { useDatasetTabs } from "./model/use-dataset-tabs";
import { DatasetSkeleton } from "./ui/dataset-tabs-skeleton";
import { DatasetDemoPage } from "./dataset-demo.page";

// Backend-less demo: the real tabs stream from suspense queries that need a
// backend, so offline we render the mock detail page instead (see dataset-
// demo.page.tsx). Any real, backend-connected build keeps the live page.
const USE_MOCK_DATASET = DEMO_MODE || DEV_AUTH_BYPASS;

function DatasetPage() {
  const { tab } = useDatasetTabs();

  if (USE_MOCK_DATASET) {
    return <DatasetDemoPage />;
  }

  return (
    <ChildPageLayout>
      <ChildPageHeader>
        {/* No separate back arrow: the title is the breadcrumb, and at this
            depth the trail renders as an arrow plus the dataset name. */}
        <Suspense fallback={<ChildPageTitleSkeleton />}>
          <DatasetDashboardTitle />
        </Suspense>
      </ChildPageHeader>

      <Suspense fallback={<DatasetSkeleton tab={tab} />}>
        <DatasetTabs />
      </Suspense>
    </ChildPageLayout>
  );
}

export const Component = DatasetPage;
