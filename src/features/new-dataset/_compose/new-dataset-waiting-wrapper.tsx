import {
  type WaitingStepKeys,
  useDatasetStatusWaiting,
} from "../_model/use-dataset-status-waiting";
import { NewDatasetWaiting } from "../_ui/new-dataset-waiting";

export function NewDatasetWaitingSuspense({
  stepKey,
  children,
}: {
  stepKey: WaitingStepKeys;
  children: React.ReactNode;
}) {
  const { isStatusValid } = useDatasetStatusWaiting(stepKey);

  if (!isStatusValid) {
    return <NewDatasetWaiting />;
  }

  return children;
}
