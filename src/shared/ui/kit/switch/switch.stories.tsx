import type { Meta, StoryObj } from "@storybook/react-vite";
import { Switch } from ".";
import { Label } from "../label";

const meta: Meta<typeof Switch> = {
  title: "UI/Kit/Switch",
  component: Switch,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "filled"],
      description: "Visual style variant",
    },
    size: {
      control: "select",
      options: ["default", "sm"],
      description: "Size of the switch",
    },
    checked: {
      control: "boolean",
      description: "Controlled checked state",
    },
    defaultChecked: {
      control: "boolean",
      description: "Initial checked state (uncontrolled)",
    },
    disabled: {
      control: "boolean",
      description: "Disables the switch",
    },
  },
  args: {
    variant: "default",
    size: "default",
    disabled: false,
    defaultChecked: false,
  },
  render: (args) => (
    <Label>
      <Switch {...args} />
      Enable feature
    </Label>
  ),
};

export default meta;
type Story = StoryObj<typeof Switch>;

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

export const SmallDefault: Story = {
  args: { size: "sm" },
};

export const SmallChecked: Story = {
  args: { size: "sm", defaultChecked: true },
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

export const FilledSmall: Story = {
  args: { variant: "filled", size: "sm" },
};

export const FilledSmallChecked: Story = {
  args: { variant: "filled", size: "sm", defaultChecked: true },
};

// Showcase: multiple instances — args not applicable
export const AllVariants: Story = {
  render: () => (
    <div className="flex gap-12">
      <div className="flex flex-col gap-4">
        <p className="text-typography-secondary text-sm">Default / M</p>
        <Label>
          <Switch />
          Unchecked
        </Label>
        <Label>
          <Switch defaultChecked />
          Checked
        </Label>
        <Label disabled>
          <Switch disabled />
          Disabled
        </Label>
        <Label disabled>
          <Switch disabled defaultChecked />
          Disabled checked
        </Label>
      </div>
      <div className="flex flex-col gap-4">
        <p className="text-typography-secondary text-sm">Default / S</p>
        <Label>
          <Switch size="sm" />
          Unchecked
        </Label>
        <Label>
          <Switch size="sm" defaultChecked />
          Checked
        </Label>
        <Label disabled>
          <Switch size="sm" disabled />
          Disabled
        </Label>
        <Label disabled>
          <Switch size="sm" disabled defaultChecked />
          Disabled checked
        </Label>
      </div>
      <div className="flex flex-col gap-4">
        <p className="text-typography-secondary text-sm">Filled / M</p>
        <Label>
          <Switch variant="filled" />
          Unchecked
        </Label>
        <Label>
          <Switch variant="filled" defaultChecked />
          Checked
        </Label>
        <Label disabled>
          <Switch variant="filled" disabled />
          Disabled
        </Label>
        <Label disabled>
          <Switch variant="filled" disabled defaultChecked />
          Disabled checked
        </Label>
      </div>
      <div className="flex flex-col gap-4">
        <p className="text-typography-secondary text-sm">Filled / S</p>
        <Label>
          <Switch variant="filled" size="sm" />
          Unchecked
        </Label>
        <Label>
          <Switch variant="filled" size="sm" defaultChecked />
          Checked
        </Label>
        <Label disabled>
          <Switch variant="filled" size="sm" disabled />
          Disabled
        </Label>
        <Label disabled>
          <Switch variant="filled" size="sm" disabled defaultChecked />
          Disabled checked
        </Label>
      </div>
    </div>
  ),
};
