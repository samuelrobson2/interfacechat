import type { Meta, StoryObj } from "@storybook/react-vite";
import { Skeleton } from ".";

const meta: Meta<typeof Skeleton> = {
  title: "UI/Kit/Skeleton",
  component: Skeleton,
  tags: ["autodocs"],
  argTypes: {
    className: {
      control: "text",
      description: "Additional classes to control size and shape",
    },
  },
  args: {
    className: "h-4 w-48",
  },
};

export default meta;
type Story = StoryObj<typeof Skeleton>;

export const Default: Story = {};

export const Circle: Story = {
  args: { className: "size-12 rounded-full" },
};

export const Block: Story = {
  args: { className: "h-24 w-64" },
};

export const ListSkeleton: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-72">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="size-8 rounded-full" />
          <div className="flex flex-col gap-1.5 flex-1">
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  ),
};
