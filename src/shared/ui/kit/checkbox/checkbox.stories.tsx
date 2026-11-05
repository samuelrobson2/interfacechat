import type { Meta, StoryObj } from "@storybook/react-vite";
import { Checkbox } from ".";
import { Label } from "../label";

const meta: Meta<typeof Checkbox> = {
  title: "UI/Kit/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "filled"],
      description: "Visual style variant",
    },
    checked: {
      control: "boolean",
      description: "Controlled checked state",
    },
    disabled: {
      control: "boolean",
      description: "Disables the checkbox",
    },
    "aria-invalid": {
      control: "boolean",
      description: "Marks the checkbox as invalid",
    },
  },
  args: {
    variant: "default",
    disabled: false,
  },
  render: (args) => (
    <Label>
      <Checkbox {...args} />
      Label text
    </Label>
  ),
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {};

export const Checked: Story = {
  args: { defaultChecked: true },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const DisabledChecked: Story = {
  args: { disabled: true, defaultChecked: true },
};

export const Invalid: Story = {
  args: { "aria-invalid": true },
};

export const FilledDefault: Story = {
  args: { variant: "filled" },
};

export const FilledChecked: Story = {
  args: { variant: "filled", defaultChecked: true },
};

export const FilledDisabled: Story = {
  args: { variant: "filled", disabled: true },
};

export const FilledDisabledChecked: Story = {
  args: { variant: "filled", disabled: true, defaultChecked: true },
};

export const FilledInvalid: Story = {
  args: { variant: "filled", "aria-invalid": true },
};

// Showcase: multiple instances — args not applicable
export const AllVariants: Story = {
  render: () => (
    <div className="flex gap-12">
      <div className="flex flex-col gap-4">
        <p className="text-typography-secondary text-sm">Default</p>
        <Label>
          <Checkbox />
          Unchecked
        </Label>
        <Label>
          <Checkbox defaultChecked />
          Checked
        </Label>
        <Label>
          <Checkbox aria-invalid="true" />
          Error
        </Label>
        <Label disabled>
          <Checkbox disabled />
          Disabled
        </Label>
        <Label disabled>
          <Checkbox disabled defaultChecked />
          Disabled checked
        </Label>
      </div>
      <div className="flex flex-col gap-4">
        <p className="text-typography-secondary text-sm">Filled</p>
        <Label>
          <Checkbox variant="filled" />
          Unchecked
        </Label>
        <Label>
          <Checkbox variant="filled" defaultChecked />
          Checked
        </Label>
        <Label>
          <Checkbox variant="filled" aria-invalid="true" />
          Error
        </Label>
        <Label disabled>
          <Checkbox variant="filled" disabled />
          Disabled
        </Label>
        <Label disabled>
          <Checkbox variant="filled" disabled defaultChecked />
          Disabled checked
        </Label>
      </div>
    </div>
  ),
};
