import type { Meta, StoryObj } from "@storybook/react-vite"

import { CircleCheckFilledIcon } from "@/shared/assets/icons/general/CircleCheckFilled"
import { Text } from "../text"
import { CircularProgress } from "."

const meta: Meta<typeof CircularProgress> = {
  title: "UI/Kit/CircularProgress",
  component: CircularProgress,
  tags: ["autodocs"],
  argTypes: {
    value: {
      control: { type: "range", min: 0, max: 100, step: 1 },
      description: "Progress value from 0 to 100",
    },
    size: {
      control: "select",
      options: ["lg", "md"],
      description: "Size of the circular progress",
    },
    color: {
      control: "select",
      options: ["default", "gradient", "blue"],
      description: "Color variant for the progress arc",
    },
    label: {
      control: "text",
      description: "Secondary label shown below the percentage",
    },
  },
  args: {
    value: 50,
    size: "lg",
    color: "default",
    label: "Placeholder text",
  },
}

export default meta
type Story = StoryObj<typeof CircularProgress>

export const Default: Story = {}

export const Gradient: Story = {
  args: { color: "gradient" },
}

export const Blue: Story = {
  args: { color: "blue" },
}

export const SizeMd: Story = {
  args: { size: "md" },
}

export const Empty: Story = {
  args: { value: 0 },
}

export const Full: Story = {
  args: { value: 100 },
}

export const NoLabel: Story = {
  args: { label: undefined },
}

// Custom children replace the default value/label content
export const CustomChildren: Story = {
  render: (args) => (
    <CircularProgress {...args} value={100} color="blue">
      <CircleCheckFilledIcon className="size-8" pathClasses="fill-blue-5" />
      <Text variant="label" color="secondary" className="text-center">
        Complete
      </Text>
    </CircularProgress>
  ),
}

// Showcase: all color variants, size lg
export const AllColorsLg: Story = {
  render: (args) => (
    <div className="flex items-center gap-6">
      <CircularProgress {...args} color="default" />
      <CircularProgress {...args} color="gradient" />
      <CircularProgress {...args} color="blue" />
    </div>
  ),
}

// Showcase: all color variants, size md
export const AllColorsMd: Story = {
  render: (args) => (
    <div className="flex items-center gap-6">
      <CircularProgress {...args} size="md" color="default" />
      <CircularProgress {...args} size="md" color="gradient" />
      <CircularProgress {...args} size="md" color="blue" />
    </div>
  ),
}

// Showcase: all states (0 / 50 / 100) for each color variant
export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      {(["default", "gradient", "blue"] as const).map((color) => (
        <div key={color} className="flex flex-col gap-4">
          <p className="text-[12px] text-typography-secondary uppercase tracking-wider">
            {color}
          </p>
          <div className="flex items-center gap-6">
            {[0, 50, 100].map((value) => (
              <CircularProgress
                key={value}
                value={value}
                color={color}
                label="Placeholder text"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  ),
  parameters: { layout: "padded" },
}

// Showcase: size comparison
export const SizeComparison: Story = {
  render: (args) => (
    <div className="flex items-end gap-6">
      <CircularProgress {...args} size="lg" />
      <CircularProgress {...args} size="md" />
    </div>
  ),
}
