import { Button, type ButtonProps } from "@/shared/ui/kit/button";
import type { NewDatasetKeys } from "../_lib/new-dataset-routes";
import { useNewDatasetNavigation } from "../_model/use-new-dataset-navigation";
import { ArrowRightIcon } from "@/shared/assets/icons/outlined/ArrowRight";

export function NewDatasetContinueButton({
  stepKey,
  ...props
}: ButtonProps & { stepKey: NewDatasetKeys }) {
  const { nextStepRoute, isFromSummary } =
    useNewDatasetNavigation({ stepKey });

  if (!nextStepRoute) return null;

  let buttonText = "Continue";
  if (isFromSummary) {
    buttonText = "Summary";
  }

  return (
    <Button className="ml-auto w-full" variant="primary" {...props}>
      {buttonText} <ArrowRightIcon pathClasses="stroke-current" />
    </Button>
  );
}
