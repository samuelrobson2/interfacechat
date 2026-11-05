import { ArrowRightIcon } from "@/shared/assets/icons/outlined/ArrowRight";
import { Button, type ButtonProps } from "@/shared/ui/kit/button";
import { useNavigate } from "react-router-dom";
import type { FinetuneStepKey } from "../_lib/finetune-routes";
import { useFinetuneStepOrderNavigation } from "../_model/use-finetune-step-order-navigation";

export function DatasetFinetuneContinueButton({
  stepKey,
  onClick,
  ...props
}: ButtonProps & { stepKey: FinetuneStepKey }) {
  const navigate = useNavigate();
  const { nextStepRoute } = useFinetuneStepOrderNavigation(stepKey);

  if (!nextStepRoute) return null;

  const handleClick: ButtonProps["onClick"] = (event) => {
    if (onClick) {
      onClick(event);
      return;
    }
    navigate(nextStepRoute);
  };

  return (
    <Button
      type="button"
      className="ml-auto w-full"
      variant="primary"
      onClick={handleClick}
      {...props}
    >
      Continue <ArrowRightIcon pathClasses="stroke-current" />
    </Button>
  );
}
