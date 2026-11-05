import type { Meta, StoryObj } from "@storybook/react-vite";
import { Slider, SliderRangeRow, SliderRow } from ".";

const meta: Meta<typeof Slider> = {
  title: "UI/Kit/Slider",
  component: Slider,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-64">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    size: {
      control: "radio",
      options: ["default", "small"],
      description: "Track and thumb size",
    },
    min: {
      control: "number",
      description: "Minimum value",
    },
    max: {
      control: "number",
      description: "Maximum value",
    },
    step: {
      control: "number",
      description: "Step increment",
    },
    disabled: {
      control: "boolean",
      description: "Disables the slider",
    },
    orientation: {
      control: "radio",
      options: ["horizontal", "vertical"],
      description: "Direction of the slider",
    },
  },
  args: {
    size: "default",
    min: 0,
    max: 100,
    step: 1,
    disabled: false,
    orientation: "horizontal",
  },
};

export default meta;
type Story = StoryObj<typeof Slider>;

export const Default: Story = {
  args: { defaultValue: [40] },
};

export const Small: Story = {
  args: { size: "small", defaultValue: [60] },
};

export const Range: Story = {
  args: { defaultValue: [20, 80] },
};

export const WithSteps: Story = {
  args: { step: 10, defaultValue: [30] },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: [50] },
};

export const Vertical: Story = {
  args: { orientation: "vertical", defaultValue: [60] },
};

// --- SliderRow stories ---

type SliderRowStory = StoryObj<typeof SliderRow>;

const sliderRowMeta = {
  title: "UI/Kit/SliderRow",
  component: SliderRow,
};

export const RowDefault: SliderRowStory = {
  render: (args) => (
    <SliderRow
      label="Title"
      defaultValue={[500]}
      min={0}
      max={1000}
      {...args}
    />
  ),
};

export const RowEmpty: SliderRowStory = {
  render: (args) => (
    <SliderRow
      label="Title"
      defaultValue={[0]}
      min={0}
      max={1000}
      {...args}
    />
  ),
};

export const RowFull: SliderRowStory = {
  render: (args) => (
    <SliderRow
      label="Title"
      defaultValue={[1000]}
      min={0}
      max={1000}
      {...args}
    />
  ),
};

export const RowWithSteps: SliderRowStory = {
  render: (args) => (
    <SliderRow
      label="Step size: 10"
      defaultValue={[50]}
      min={0}
      max={100}
      step={10}
      {...args}
    />
  ),
};

export const RowDisabled: SliderRowStory = {
  render: (args) => (
    <SliderRow
      label="Disabled"
      defaultValue={[300]}
      min={0}
      max={1000}
      {...args}
      disabled
    />
  ),
};

// --- SliderRangeRow stories ---

type SliderRangeRowStory = StoryObj<typeof SliderRangeRow>;

export const RangeRowDefault: SliderRangeRowStory = {
  render: (args) => (
    <SliderRangeRow
      defaultValue={[25, 75]}
      min={0}
      max={100}
      {...args}
    />
  ),
};

export const RangeRowFull: SliderRangeRowStory = {
  render: (args) => (
    <SliderRangeRow
      defaultValue={[0, 100]}
      min={0}
      max={100}
      {...args}
    />
  ),
};

export const RangeRowDisabled: SliderRangeRowStory = {
  render: (args) => (
    <SliderRangeRow
      defaultValue={[20, 60]}
      min={0}
      max={100}
      {...args}
      disabled
    />
  ),
};

// Showcase: all slider variants side by side
export const AllVariants: Story = {
  render: (args) => (
    <div className="flex flex-col gap-8 w-80">
      <div className="flex flex-col gap-2">
        <p className="text-[12px] text-typography-secondary uppercase tracking-wider">
          Standalone
        </p>
        <Slider defaultValue={[40]} {...args} />
        <Slider defaultValue={[60]} size="small" {...args} />
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-[12px] text-typography-secondary uppercase tracking-wider">
          SliderRow
        </p>
        <SliderRow label="Title" defaultValue={[0]} min={0} max={1000} {...args} />
        <SliderRow label="Title" defaultValue={[500]} min={0} max={1000} {...args} />
        <SliderRow label="Title" defaultValue={[1000]} min={0} max={1000} {...args} />
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-[12px] text-typography-secondary uppercase tracking-wider">
          SliderRangeRow
        </p>
        <SliderRangeRow defaultValue={[25, 75]} min={0} max={100} {...args} />
        <SliderRangeRow defaultValue={[0, 100]} min={0} max={100} {...args} />
      </div>
    </div>
  ),
  parameters: { layout: "padded" },
};

void sliderRowMeta;
