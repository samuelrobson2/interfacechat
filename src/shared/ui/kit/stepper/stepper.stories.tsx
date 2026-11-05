import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import {
  Stepper,
  StepperContent,
  StepperIndicator,
  StepperItem,
  StepperNav,
  StepperPanel,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
  type StepperProps,
} from ".";

const STEPS = [
  { step: 1, title: "Account" },
  { step: 2, title: "Profile" },
  { step: 3, title: "Review" },
];

const meta: Meta<StepperProps> = {
  title: "UI/Kit/Stepper",
  component: Stepper,
  tags: ["autodocs"],
  argTypes: {
    orientation: {
      control: "radio",
      options: ["horizontal", "vertical"],
      description: "Layout direction of the stepper",
    },
    defaultValue: {
      control: { type: "number", min: 1, max: 3 },
      description: "Initially active step (1-indexed)",
    },
  },
  args: {
    orientation: "horizontal",
    defaultValue: 2,
  },
  render: (args) => (
    <div className="w-full max-w-lg">
      <Stepper {...args}>
        <StepperNav>
          {STEPS.map(({ step, title }, idx) => (
            <React.Fragment key={step}>
              <StepperItem step={step}>
                <StepperTrigger>
                  <StepperIndicator className="size-8 text-sm font-medium">
                    {step}
                  </StepperIndicator>
                  <StepperTitle>{title}</StepperTitle>
                </StepperTrigger>
              </StepperItem>
              {idx < STEPS.length - 1 && (
                <StepperItem step={step}>
                  <StepperSeparator />
                </StepperItem>
              )}
            </React.Fragment>
          ))}
        </StepperNav>
        <StepperPanel className="mt-6">
          {STEPS.map(({ step, title }) => (
            <StepperContent key={step} value={step}>
              <p className="text-typography-secondary text-sm">
                Content for step {step}: {title}
              </p>
            </StepperContent>
          ))}
        </StepperPanel>
      </Stepper>
    </div>
  ),
};

export default meta;
type Story = StoryObj<StepperProps>;

export const Default: Story = {};

export const Vertical: Story = {
  args: { orientation: "vertical" },
};

export const FirstStep: Story = {
  args: { defaultValue: 1 },
};

export const LastStep: Story = {
  args: { defaultValue: 3 },
};
