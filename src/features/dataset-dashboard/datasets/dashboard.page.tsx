import {
  ChildPageHeader,
  ChildPageLayout,
  ChildPageTitle,
} from "@/shared/ui/child-page-layout";
import { Suspense } from "react";
import { DatasetsTable } from "./compose/datasets-table";
import { DatasetsSkeleton } from "./ui/datasets-skeleton";
import { LocationWeatherWidget } from "@/services/internalization";
import { GradientText } from "@/shared/ui/gradient-text";
import { useIsMobile } from "@/shared/lib/react/use-mobile";

function DashboardPage() {
  const isMobile = useIsMobile();

  return (
    <ChildPageLayout className="pb-8">
      {!isMobile && <LocationWeatherWidget />}

      <ChildPageHeader>
        <ChildPageTitle>
          Welcome back, <GradientText>Samuel!</GradientText>
        </ChildPageTitle>
      </ChildPageHeader>

      <Suspense fallback={<DatasetsSkeleton />}>
        <DatasetsTable />
      </Suspense>
    </ChildPageLayout>
  );
}

export const Component = DashboardPage;
