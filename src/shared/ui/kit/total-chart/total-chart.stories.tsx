import type { Meta, StoryObj } from "@storybook/react-vite";

import { TotalChart } from ".";

const DEMO_SEGMENTS = [
  { label: "Option 1", value: 25, color: "blue-4" },
  { label: "Option 2", value: 25, color: "orange-5" },
  { label: "Option 3", value: 25, color: "yellow-5" },
  { label: "Option 4", value: 12.5, color: "green-5" },
];

const meta: Meta<typeof TotalChart> = {
  title: "UI/Kit/TotalChart",
  component: TotalChart,
  tags: ["autodocs"],
  argTypes: {
    title: {
      control: "text",
      description: "Chart heading",
    },
    totalMax: {
      control: { type: "number", min: 1, step: 10 },
      description: "Maximum capacity",
    },
    unit: {
      control: "text",
      description: "Value unit label (e.g. GB, MB, items)",
    },
    centerLabel: {
      control: "text",
      description: "Label inside the donut chart",
    },
  },
  args: {
    title: "Usage details",
    totalMax: 100,
    unit: "GB",
    centerLabel: "Used",
    segments: DEMO_SEGMENTS,
  },
  decorators: [
    (Story) => (
      <div className="w-[360px]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof TotalChart>;

export const Default: Story = {};

export const HalfUsed: Story = {
  args: {
    segments: [
      { label: "Documents", value: 20, color: "blue-4" },
      { label: "Photos", value: 15, color: "orange-5" },
      { label: "Videos", value: 15, color: "yellow-5" },
    ],
  },
};

export const FullCapacity: Story = {
  args: {
    segments: [
      { label: "System", value: 30, color: "blue-4" },
      { label: "Apps", value: 25, color: "orange-5" },
      { label: "Media", value: 25, color: "yellow-5" },
      { label: "Other", value: 20, color: "green-5" },
    ],
  },
};

export const SingleSegment: Story = {
  args: {
    segments: [{ label: "Storage used", value: 42, color: "blue-5" }],
  },
};

export const Empty: Story = {
  args: {
    segments: [
      { label: "Option 1", value: 0, color: "blue-4" },
      { label: "Option 2", value: 0, color: "orange-5" },
    ],
  },
};

export const CustomColors: Story = {
  args: {
    title: "Resources",
    totalMax: 100,
    unit: "%",
    centerLabel: "Load",
    segments: [
      { label: "CPU", value: 35, color: "red-5" },
      { label: "Memory", value: 25, color: "mint-2" },
      { label: "Disk", value: 15, color: "rose-2" },
    ],
  },
};

// Showcase: width variations
export const WidthVariations: Story = {
  decorators: [
    (Story) => (
      <div className="flex flex-col gap-6">
        <Story />
      </div>
    ),
  ],
  render: (args) => (
    <>
      <div className="w-[320px]">
        <TotalChart {...args} title="Compact (320px)" />
      </div>
      <div className="w-[400px]">
        <TotalChart {...args} title="Medium (400px)" />
      </div>
      <div className="w-[500px]">
        <TotalChart {...args} title="Wide (500px)" />
      </div>
    </>
  ),
};
