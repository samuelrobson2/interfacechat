import type { Meta, StoryObj } from "@storybook/react-vite";
import { Tooltip, TooltipContent, TooltipTrigger } from ".";

type TooltipDemoProps = {
  side: "top" | "right" | "bottom" | "left";
  showArrow: boolean;
  content: string;
  triggerLabel: string;
};

const TooltipDemo = ({ side, showArrow, content, triggerLabel }: TooltipDemoProps) => (
  <div className="flex items-center justify-center h-32">
    <Tooltip>
      <TooltipTrigger asChild>
        <button className="px-4 py-2 rounded border border-stroke-secondary text-typography-primary text-sm cursor-pointer">
          {triggerLabel}
        </button>
      </TooltipTrigger>
      <TooltipContent side={side} showArrow={showArrow}>
        {content}
      </TooltipContent>
    </Tooltip>
  </div>
);

const meta: Meta<typeof TooltipDemo> = {
  title: "UI/Kit/Tooltip",
  component: TooltipDemo,
  tags: ["autodocs"],
  argTypes: {
    side: {
      control: "select",
      options: ["top", "right", "bottom", "left"],
      description: "Side where the tooltip appears",
    },
    showArrow: {
      control: "boolean",
      description: "Whether to show the arrow pointer",
    },
    content: {
      control: "text",
      description: "Tooltip content text",
    },
    triggerLabel: {
      control: "text",
      description: "Trigger button label",
    },
  },
  args: {
    side: "top",
    showArrow: false,
    content: "This is a tooltip",
    triggerLabel: "Hover me",
  },
};

export default meta;
type Story = StoryObj<typeof TooltipDemo>;

export const Default: Story = {};

export const WithArrow: Story = {
  args: { showArrow: true },
};

export const BottomSide: Story = {
  args: { side: "bottom" },
};

export const RightSide: Story = {
  args: { side: "right" },
};

export const LeftSide: Story = {
  args: { side: "left" },
};

export const TopSide: Story = {
  args: { side: "top" },
};
