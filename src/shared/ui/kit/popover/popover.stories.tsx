import type { Meta, StoryObj } from "@storybook/react-vite";
import { Popover, PopoverContent, PopoverTrigger } from ".";
import { Button } from "../button";

const meta: Meta<typeof Popover> = {
  title: "UI/Kit/Popover",
  component: Popover,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Popover>;

export const Default: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="secondary">Open Popover</Button>
      </PopoverTrigger>
      <PopoverContent>
        <p className="text-sm text-typography-primary">
          This is popover content. You can put any UI here.
        </p>
      </PopoverContent>
    </Popover>
  ),
};

export const AllAlignments: Story = {
  parameters: { layout: "fullscreen" },
  render: () => (
    <div className="flex items-center justify-center gap-6 h-screen">
      {(["start", "center", "end"] as const).map((align) => (
        <Popover key={align} defaultOpen>
          <PopoverTrigger asChild>
            <Button variant="secondary">{align}</Button>
          </PopoverTrigger>
          <PopoverContent align={align}>
            <p className="text-sm text-typography-primary">Aligned: {align}</p>
          </PopoverContent>
        </Popover>
      ))}
    </div>
  ),
};

export const AllSides: Story = {
  parameters: { layout: "fullscreen" },
  render: () => (
    <div className="flex flex-col items-center justify-center gap-10 h-screen">
      <Popover defaultOpen>
        <PopoverTrigger asChild>
          <Button variant="secondary">Top side</Button>
        </PopoverTrigger>
        <PopoverContent side="top">
          <p className="text-sm text-typography-primary">Opens on top</p>
        </PopoverContent>
      </Popover>

      <div className="flex gap-32">
        <Popover defaultOpen>
          <PopoverTrigger asChild>
            <Button variant="secondary">Left side</Button>
          </PopoverTrigger>
          <PopoverContent side="left">
            <p className="text-sm text-typography-primary">Opens on left</p>
          </PopoverContent>
        </Popover>

        <Popover defaultOpen>
          <PopoverTrigger asChild>
            <Button variant="secondary">Right side</Button>
          </PopoverTrigger>
          <PopoverContent side="right">
            <p className="text-sm text-typography-primary">Opens on right</p>
          </PopoverContent>
        </Popover>
      </div>

      <Popover defaultOpen>
        <PopoverTrigger asChild>
          <Button variant="secondary">Bottom side</Button>
        </PopoverTrigger>
        <PopoverContent side="bottom">
          <p className="text-sm text-typography-primary">Opens on bottom</p>
        </PopoverContent>
      </Popover>
    </div>
  ),
};
