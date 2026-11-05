import { ChildPageLayout } from "@/shared/ui/child-page-layout";
import { Suspense } from "react";
import { AutoScientistDatasetsTable } from "./compose/autoscientist-datasets-table";
import { AutoScientistDatasetsSkeleton } from "./ui/datasets-skeleton";

function AutoScientistDashboardPage() {
  return (
    // Was `pl-[-165px]`, which is not a valid CSS length — it never applied, so
    // this page has always rendered with the standard gutter. Dropped rather
    // than guessed at; if the table wants to run full-bleed left, the way to say
    // so is `push={false}` plus `md:pl-0`.
    <ChildPageLayout>
      <Suspense fallback={<AutoScientistDatasetsSkeleton />}>
        <AutoScientistDatasetsTable />
      </Suspense>
    </ChildPageLayout>
  );
}

export const Component = AutoScientistDashboardPage;
