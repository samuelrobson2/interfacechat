import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from ".";

const meta: Meta<typeof SelectTrigger> = {
  title: "UI/Kit/Select",
  component: SelectTrigger,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "outline", "pill"],
      description: "Visual style of the trigger",
    },
    size: {
      control: "select",
      options: ["default", "sm", "pill"],
      description: "Size of the trigger",
    },
    disabled: {
      control: "boolean",
      description: "Disables the select",
    },
  },
  args: {
    variant: "default",
    size: "default",
    disabled: false,
  },
  render: (args) => (
    <Select>
      <SelectTrigger className="w-64" {...args}>
        <SelectValue placeholder="Select an option" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="option-1">Option 1</SelectItem>
        <SelectItem value="option-2">Option 2</SelectItem>
        <SelectItem value="option-3">Option 3</SelectItem>
      </SelectContent>
    </Select>
  ),
};

export default meta;
type Story = StoryObj<typeof SelectTrigger>;

export const Default: Story = {};

export const Outline: Story = {
  args: { variant: "outline", size: "sm" },
};

export const Pill: Story = {
  args: { variant: "pill", size: "pill" },
};

export const WithGroups: Story = {
  render: (args) => (
    <Select>
      <SelectTrigger className="w-64" {...args}>
        <SelectValue placeholder="Select a fruit" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Fruits</SelectLabel>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
          <SelectItem value="orange">Orange</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Vegetables</SelectLabel>
          <SelectItem value="carrot">Carrot</SelectItem>
          <SelectItem value="broccoli">Broccoli</SelectItem>
          <SelectItem value="spinach">Spinach</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
};

export const WithDisabledItem: Story = {
  render: (args) => (
    <Select>
      <SelectTrigger className="w-64" {...args}>
        <SelectValue placeholder="Select a plan" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="free">Free</SelectItem>
        <SelectItem value="pro">Pro</SelectItem>
        <SelectItem value="enterprise" disabled>
          Enterprise (Contact us)
        </SelectItem>
      </SelectContent>
    </Select>
  ),
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const WithError: Story = {
  args: { error: "This field is required" },
};
