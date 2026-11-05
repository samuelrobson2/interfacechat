import { ArrowLeftIcon } from "@/shared/assets/icons/outlined/ArrowLeft";
import { Button } from "@/shared/ui/kit/button";
import type { ButtonProps } from "@/shared/ui/kit/button";
import { Link } from "react-router-dom";
import type { NewDatasetKeys } from "../_lib/new-dataset-routes";
import { useNewDatasetNavigation } from "../_model/use-new-dataset-navigation";

export function NewDatasetBackButton({
  stepKey,
  ...props
}: ButtonProps & {
  stepKey: NewDatasetKeys;
}) {
  const { previousStepRoute } = useNewDatasetNavigation({ stepKey });

  if (!previousStepRoute) return null;

  return (
    <Button className="w-full" variant="secondary" asChild {...props}>
      <Link to={previousStepRoute}>
        <ArrowLeftIcon pathClasses="stroke-current" />
        Back
      </Link>
    </Button>
  );
}
