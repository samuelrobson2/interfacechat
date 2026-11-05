import { Suspense, useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { DatasetFinetuneHyperparametersPageContent } from "./compose/dataset-finetune-hyperparameters-page-content";
import { FinetuneHyperparametersLoader } from "./ui/finetune-hyperparameters-loader";

const ENTER_LOADER_MS = 700;
type HyperparametersLocationState = {
  forceRecipeStepRefetch?: boolean;
};

function DatasetFinetuneHyperparametersPage() {
  const { dataset_id } = useParams();
  const { state } = useLocation();
  const shouldShowEnterLoader = Boolean(
    (state as HyperparametersLocationState | null)?.forceRecipeStepRefetch,
  );
  const [showEnterLoader, setShowEnterLoader] = useState(shouldShowEnterLoader);

  useEffect(() => {
    if (!shouldShowEnterLoader) return;
    const timerId = window.setTimeout(() => {
      setShowEnterLoader(false);
    }, ENTER_LOADER_MS);
    return () => window.clearTimeout(timerId);
  }, [shouldShowEnterLoader]);

  if (!dataset_id) return null;
  if (showEnterLoader) return <FinetuneHyperparametersLoader />;

  return (
    <Suspense fallback={<FinetuneHyperparametersLoader />}>
      <DatasetFinetuneHyperparametersPageContent dataset_id={dataset_id} />
    </Suspense>
  );
}

export const Component = DatasetFinetuneHyperparametersPage;
