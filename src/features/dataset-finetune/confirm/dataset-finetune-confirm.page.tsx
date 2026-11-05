import { Suspense } from "react";
import { FinetuneDatasetTitle } from "../_compose/finetune-dataset-title";
import { ConfirmPage } from "./compose/confirm-page";
import { ConfirmPageSkeleton } from "./ui/confirm-page-skeleton";
import { useSessionStore } from "@/services/auth";

function DatasetFinetuneConfirmPage() {
  const user = useSessionStore((state) => state.user);
  return (
    <div className="w-full h-screen pt-25 gap-12 flex flex-col items-center">
      <FinetuneDatasetTitle
        title={`${user?.profile?.name}, confirm your optimization choices`}
      />
      <Suspense fallback={<ConfirmPageSkeleton />}>
        <ConfirmPage />
      </Suspense>
    </div>
  );
}

export const Component = DatasetFinetuneConfirmPage;
