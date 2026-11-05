import type { Meta, StoryObj } from "@storybook/react-vite";
import { Separator } from ".";

const meta: Meta<typeof Separator> = {
  title: "UI/Kit/Separator",
  component: Separator,
  decorators: [
    (Story) => (
      <div className="w-64 h-12">
        <Story />
      </div>
    ),
  ],
  tags: ["autodocs"],
  argTypes: {
    orientation: {
      control: "radio",
      options: ["horizontal", "vertical"],
      description: "Direction of the separator",
    },
    color: {
      control: "radio",
      options: ["primary", "secondary"],
      description: "Color of the separator line",
    },
    decorative: {
      control: "boolean",
      description:
        "When true, treated as decorative (not in accessibility tree)",
    },
  },
  args: {
    orientation: "horizontal",
    color: "primary",
    decorative: true,
  },
};

export default meta;
type Story = StoryObj<typeof Separator>;

export const Horizontal: Story = {};

export const Vertical: Story = {
  args: { orientation: "vertical" },
};

export const Secondary: Story = {
  args: { color: "secondary" },
};
