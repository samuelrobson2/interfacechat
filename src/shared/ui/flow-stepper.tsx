import { cn } from "@/shared/lib/css";
import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperNav,
  StepperSeparator,
  StepperTitle,
} from "@/shared/ui/kit/stepper";
import type { ApiSchemas } from "../api/schema";

export type FlowStep = {
  key: string;
  title: string;
  order: number;
};

export function FlowStepper({
  steps,
  stepKey,
}: {
  steps: ApiSchemas["Step"][];
  stepKey: string;
}) {
  const currentStep = steps?.find((s) => s.key === stepKey)?.order ?? 1;

  return (
    <Stepper className="py-12" value={currentStep}>
      <StepperNav className="h-13">
        <StepperItem step={0} className="h-2 not-last:flex-[0.5]">
          <StepperSeparator />
        </StepperItem>

        {steps.map((step, index) => (
          <StepperItem
            key={step.key}
            step={step.order}
            className={cn(steps.length === index + 1 && "flex-[0.5]")}
          >
            <div className="relative">
              <StepperIndicator className="size-2" />
              <StepperTitle className="absolute left-1/2 top-7.5 -translate-x-1/2 whitespace-nowrap">
                {step.step_name.replace("_", " ")}
              </StepperTitle>
            </div>
            <StepperSeparator />
          </StepperItem>
        ))}
      </StepperNav>
    </Stepper>
  );
}
