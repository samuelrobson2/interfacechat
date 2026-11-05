import type { Meta, StoryObj } from "@storybook/react-vite";
import { Text, type TextProps } from ".";

const meta: Meta<TextProps> = {
  title: "UI/Kit/Text",
  component: Text,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["h1", "h2", "h3", "title", "subtitle", "body", "label"],
      description: "Typography scale variant",
    },
    weight: {
      control: "select",
      options: ["light", "regular", "bold"],
      description: "Font weight",
    },
    color: {
      control: "select",
      options: ["primary", "secondary", "inverse", "error", "disabled", "none"],
      description: "Text color",
    },
    as: {
      control: "select",
      options: ["p", "span", "div", "label", "h1", "h2"],
      description: "Rendered HTML element",
    },
    children: {
      control: "text",
    },
  },
  args: {
    variant: "body",
    weight: "light",
    color: "primary",
    as: "p",
    children: "The quick brown fox jumps over the lazy dog",
  },
};

export default meta;
type Story = StoryObj<TextProps>;

export const Default: Story = {};

export const Heading1: Story = {
  args: { variant: "h1", as: "h1", children: "Heading 1 — 40px" },
};

export const Heading2: Story = {
  args: { variant: "h2", as: "h2", children: "Heading 2 — 28px" },
};

export const Heading3: Story = {
  args: { variant: "h3", children: "Heading 3 — 24px" },
};

export const Title: Story = {
  args: { variant: "title", children: "Title — 20px" },
};

export const Subtitle: Story = {
  args: { variant: "subtitle", children: "Subtitle — 18px" },
};

export const Label: Story = {
  args: { variant: "label", children: "Label — 14px" },
};

export const Secondary: Story = {
  args: { color: "secondary" },
};

export const Error: Story = {
  args: { color: "error", children: "Error message text" },
};

export const Bold: Story = {
  args: { weight: "bold" },
};
