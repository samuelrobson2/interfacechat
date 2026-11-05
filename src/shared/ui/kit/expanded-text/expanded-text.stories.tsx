import type { Meta, StoryObj } from "@storybook/react-vite";
import { ExpandedText, type ExpandedTextProps } from ".";

const LONG_TEXT =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.";

const SHORT_TEXT = "Short text that fits in one line without overflow.";

const meta: Meta<ExpandedTextProps> = {
  title: "UI/Kit/ExpandedText",
  component: ExpandedText,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    maxLines: {
      control: { type: "number", min: 1, max: 10 },
      description: "Max visible lines before truncation",
    },
    seeMoreText: {
      control: "text",
      description: "Label for the expand button",
    },
    seeLessText: {
      control: "text",
      description: "Label for the collapse button",
    },
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
    maxLines: 3,
    seeMoreText: "See more",
    seeLessText: "See less",
    variant: "body",
    weight: "light",
    color: "primary",
    children: LONG_TEXT,
  },
};

export default meta;
type Story = StoryObj<ExpandedTextProps>;

export const Default: Story = {};

export const Short: Story = {
  args: { children: SHORT_TEXT },
};

export const TwoLines: Story = {
  args: { maxLines: 2 },
};

export const CustomLabels: Story = {
  args: { seeMoreText: "Read more →", seeLessText: "← Collapse" },
};

export const SecondaryColor: Story = {
  args: { color: "secondary" },
};
