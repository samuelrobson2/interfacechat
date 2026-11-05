import { usePaymentLoader } from "@/services/payment";
import {
  ChildPageBackLink,
  ChildPageHeader,
  ChildPageLayout,
  ChildPageTitle,
} from "@/shared/ui/child-page-layout";
import { Suspense } from "react";
import { PlansList } from "@/services/plans";
import { PlansListSkeleton } from "@/services/plans";

function PlansPage() {
  usePaymentLoader();

  return (
    <ChildPageLayout className="gap-15">
      <ChildPageHeader>
        <ChildPageBackLink />
        <ChildPageTitle>Plans & Credits</ChildPageTitle>
      </ChildPageHeader>

      <Suspense fallback={<PlansListSkeleton />}>
        <PlansList />
      </Suspense>
    </ChildPageLayout>
  );
}

export const Component = PlansPage;
