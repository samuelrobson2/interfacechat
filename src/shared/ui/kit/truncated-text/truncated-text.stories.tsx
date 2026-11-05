import type { Meta, StoryObj } from "@storybook/react-vite";
import { TruncatedText, type TruncatedTextProps } from ".";

const LONG_SINGLE_LINE =
  "This is a very long single-line text that will be truncated because it exceeds the container width significantly.";

const LONG_MULTILINE =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.";

const meta: Meta<TruncatedTextProps> = {
  title: "UI/Kit/TruncatedText",
  component: TruncatedText,
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
      description: "Max lines before truncation with ellipsis",
    },
    tooltipContent: {
      control: "text",
      description: "Custom tooltip content; defaults to children",
    },
    variant: {
      control: "select",
      options: ["h1", "h2", "h3", "title", "body", "label"],
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
    maxLines: 1,
    variant: "body",
    weight: "light",
    color: "primary",
    children: LONG_SINGLE_LINE,
  },
};

export default meta;
type Story = StoryObj<TruncatedTextProps>;

export const Default: Story = {};

export const MultiLine: Story = {
  args: {
    maxLines: 2,
    children: LONG_MULTILINE,
  },
};

export const WithCustomTooltip: Story = {
  args: {
    tooltipContent: "Full content shown in the tooltip separately from text",
    children: LONG_SINGLE_LINE,
  },
};

export const NoOverflow: Story = {
  args: {
    children: "Short text — no tooltip rendered.",
  },
};

export const TitleVariant: Story = {
  args: {
    variant: "title",
    weight: "bold",
    children: LONG_SINGLE_LINE,
  },
};
