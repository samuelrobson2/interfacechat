import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { useId } from "react";
import { RadioGroup, RadioGroupItem, type RadioGroupItemProps } from ".";
import { Label } from "../label";

type RadioGroupStoryArgs = React.ComponentProps<typeof RadioGroup> & {
  itemVariant?: RadioGroupItemProps["variant"];
};

const meta: Meta<RadioGroupStoryArgs> = {
  title: "UI/Kit/RadioGroup",
  component: RadioGroup,
  tags: ["autodocs"],
  argTypes: {
    disabled: {
      control: "boolean",
      description: "Disables all items in the group",
    },
    orientation: {
      control: "radio",
      options: ["vertical", "horizontal"],
      description: "Layout orientation of the group",
    },
    itemVariant: {
      control: "select",
      options: ["default", "filled"],
      description: "Visual style variant applied to all RadioGroupItems",
    },
  },
  args: {
    disabled: false,
    orientation: "vertical",
    defaultValue: "option1",
    itemVariant: "default",
  },
  render: ({ itemVariant, ...args }) => {
    const id = useId();

    return (
      <RadioGroup {...args}>
        <Label htmlFor={`${id}-1`}>
          <RadioGroupItem id={`${id}-1`} value="option1" variant={itemVariant} />
          Option 1
        </Label>
        <Label htmlFor={`${id}-2`}>
          <RadioGroupItem id={`${id}-2`} value="option2" variant={itemVariant} />
          Option 2
        </Label>
        <Label htmlFor={`${id}-3`}>
          <RadioGroupItem id={`${id}-3`} value="option3" variant={itemVariant} />
          Option 3
        </Label>
      </RadioGroup>
    );
  },
};

export default meta;
type Story = StoryObj<RadioGroupStoryArgs>;

export const Default: Story = {};

export const Disabled: Story = {
  args: { disabled: true },
};

export const Horizontal: Story = {
  args: { orientation: "horizontal" },
};

export const WithPartialDisabled: Story = {
  render: ({ itemVariant, ...args }) => (
    <RadioGroup {...args}>
      <Label htmlFor="rgp-1">
        <RadioGroupItem id="rgp-1" value="option1" variant={itemVariant} />
        Option 1
      </Label>
      <Label htmlFor="rgp-2">
        <RadioGroupItem id="rgp-2" value="option2" variant={itemVariant} />
        Option 2
      </Label>
      <Label htmlFor="rgp-3" disabled>
        <RadioGroupItem id="rgp-3" value="option3" variant={itemVariant} disabled />
        Option 3 (disabled)
      </Label>
    </RadioGroup>
  ),
};

export const FilledDefault: Story = {
  args: { itemVariant: "filled" },
};

export const FilledDisabled: Story = {
  args: { disabled: true, itemVariant: "filled" },
};

// Showcase: multiple instances — args not applicable
export const AllVariants: Story = {
  render: () => (
    <div className="flex gap-12">
      <div className="flex flex-col gap-4">
        <p className="text-typography-secondary text-sm">Default</p>
        <RadioGroup defaultValue="option1">
          <Label htmlFor="av-d-1">
            <RadioGroupItem id="av-d-1" value="option1" />
            Option 1
          </Label>
          <Label htmlFor="av-d-2">
            <RadioGroupItem id="av-d-2" value="option2" />
            Option 2
          </Label>
          <Label htmlFor="av-d-3">
            <RadioGroupItem id="av-d-3" value="option3" />
            Option 3
          </Label>
        </RadioGroup>
      </div>
      <div className="flex flex-col gap-4">
        <p className="text-typography-secondary text-sm">Filled</p>
        <RadioGroup defaultValue="option1">
          <Label htmlFor="av-f-1">
            <RadioGroupItem
              id="av-f-1"
              value="option1"
              variant="filled"
            />
            Option 1
          </Label>
          <Label htmlFor="av-f-2">
            <RadioGroupItem
              id="av-f-2"
              value="option2"
              variant="filled"
            />
            Option 2
          </Label>
          <Label htmlFor="av-f-3">
            <RadioGroupItem
              id="av-f-3"
              value="option3"
              variant="filled"
            />
            Option 3
          </Label>
        </RadioGroup>
      </div>
    </div>
  ),
};
