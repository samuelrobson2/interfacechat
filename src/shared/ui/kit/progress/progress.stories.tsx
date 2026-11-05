import type { Meta, StoryObj } from "@storybook/react-vite";

import { Progress, ProgressRow } from ".";

const meta: Meta<typeof ProgressRow> = {
  title: "UI/Kit/Progress",
  component: ProgressRow,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    value: {
      control: { type: "range", min: 0, max: 100, step: 1 },
      description: "Progress value from 0 to 100",
    },
    color: {
      control: "select",
      options: ["default", "gradient", "blue"],
      description:
        "Color variant for the progress indicator and completion icon",
    },
    label: {
      control: "text",
      description: "Label text shown on the left",
    },
  },
  args: {
    value: 40,
    color: "default",
    label: "Placeholder text",
  },
  render: (args) => (
    <ProgressRow {...args}>
      <Progress value={args.value} color={args.color} />
    </ProgressRow>
  ),
};

export default meta;
type Story = StoryObj<typeof ProgressRow>;

// Full composition: row header + progress bar as children
export const Default: Story = {};

export const Gradient: Story = {
  args: {
    color: "gradient",
  },
};

export const Blue: Story = {
  args: {
    color: "blue",
  },
};

export const Empty: Story = {
  args: {
    value: 0,
  },
};

export const Complete: Story = {
  args: {
    value: 100,
  },
};

// Showcase: bar only without row
export const BarOnly: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3">
      <Progress value={args.value} color="default" />
      <Progress value={args.value} color="gradient" />
      <Progress value={args.value} color="blue" />
    </div>
  ),
};

// Showcase: all states (0% / 40% / 100%) for each color variant
export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-8 w-80">
      {(["default", "gradient", "blue"] as const).map((color) => (
        <div key={color} className="flex flex-col gap-4">
          <p className="text-[12px] text-typography-secondary uppercase tracking-wider">
            {color}
          </p>
          {[0, 40, 100].map((value) => (
            <ProgressRow
              key={value}
              label="Placeholder text"
              value={value}
              color={color}
            >
              <Progress value={value} color={color} />
            </ProgressRow>
          ))}
        </div>
      ))}
    </div>
  ),
  parameters: { layout: "padded" },
};
