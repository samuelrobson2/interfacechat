import type { Meta, StoryObj } from "@storybook/react-vite";
import { SelectedText } from ".";
import type { TextProps } from "../text";

const meta: Meta<TextProps> = {
  title: "UI/Kit/SelectedText",
  component: SelectedText,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["h1", "h2", "h3", "title", "body", "label"],
      description: "Typography scale variant",
    },
    weight: {
      control: "select",
      options: ["light", "regular", "bold"],
    },
    color: {
      control: "select",
      options: ["primary", "secondary", "inverse", "error", "disabled", "none"],
    },
    children: { control: "text" },
  },
  args: {
    variant: "body",
    weight: "light",
    color: "primary",
    children: "Highlighted text",
  },
};

export default meta;
type Story = StoryObj<TextProps>;

export const Default: Story = {};

export const Heading: Story = {
  args: {
    variant: "h2",
    weight: "bold",
    children: "Important heading",
  },
};

export const Label: Story = {
  args: {
    variant: "label",
    children: "Selected label text",
  },
};
