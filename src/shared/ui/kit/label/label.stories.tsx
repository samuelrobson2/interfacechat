import type { Meta, StoryObj } from "@storybook/react-vite";
import { Label } from ".";
import { Checkbox } from "../checkbox";
import { RadioGroup, RadioGroupItem } from "../radio-group";

const meta: Meta<typeof Label> = {
  title: "UI/Kit/Label",
  component: Label,
  tags: ["autodocs"],
  argTypes: {
    disabled: {
      control: "boolean",
      description: "Renders label in disabled state",
    },
  },
  args: {
    disabled: false,
    children: "Label text",
  },
};

export default meta;
type Story = StoryObj<typeof Label>;

export const Default: Story = {};

export const Disabled: Story = {
  args: { disabled: true },
};

export const WithCheckbox: Story = {
  render: (args) => (
    <Label htmlFor="story-checkbox" {...args}>
      <Checkbox id="story-checkbox" />
      Accept terms and conditions
    </Label>
  ),
};

export const WithRadioItem: Story = {
  render: (args) => (
    <RadioGroup defaultValue="option1">
      <Label htmlFor="story-radio-1" {...args}>
        <RadioGroupItem id="story-radio-1" value="option1" />
        Option 1
      </Label>
      <Label htmlFor="story-radio-2" {...args}>
        <RadioGroupItem id="story-radio-2" value="option2" />
        Option 2
      </Label>
      <Label htmlFor="story-radio-3" {...args}>
        <RadioGroupItem id="story-radio-3" value="option3" />
        Option 3
      </Label>
    </RadioGroup>
  ),
};

