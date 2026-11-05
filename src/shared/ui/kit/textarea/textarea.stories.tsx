import type { Meta, StoryObj } from "@storybook/react-vite";
import { Textarea, type TextareaProps } from ".";

const meta: Meta<TextareaProps> = {
  title: "UI/Kit/Textarea",
  component: Textarea,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-100">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    variant: {
      control: "select",
      options: ["floating", "plain"],
      description: "Label behavior variant",
    },
    fill: {
      control: "select",
      options: ["default", "filled", "underline"],
      description: "Visual fill style",
    },
    shape: {
      control: "select",
      options: ["square", "rounded"],
      description: "Border radius shape (rounded only affects filled)",
    },
    label: {
      control: "text",
      description: "Floating label text",
    },
    placeholder: {
      control: "text",
      description: "Placeholder text",
    },
    error: {
      control: "text",
      description: "Error message displayed below the textarea",
    },
    isError: {
      control: "boolean",
      description: "Applies error styling without a message",
    },
    disabled: {
      control: "boolean",
      description: "Disables the textarea",
    },
    maxRows: {
      control: { type: "number", min: 1, max: 10 },
      description: "Maximum number of visible rows before scrolling",
    },
    minRows: {
      control: { type: "number", min: 1, max: 10 },
      description: "Minimum number of visible rows",
    },
  },
  args: {
    label: "Your message",
    placeholder: "Enter your message...",
    disabled: false,
    isError: false,
    maxRows: 4,
    minRows: 1,
  },
};

export default meta;
type Story = StoryObj<TextareaProps>;

export const Default: Story = {};

export const WithError: Story = {
  args: { error: "This field is required" },
};

export const IsError: Story = {
  args: { isError: true },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const DisabledWithValue: Story = {
  args: { disabled: true, defaultValue: "Pre-filled content that is disabled" },
};

export const PlainFilled: Story = {
  args: {
    variant: "plain",
    fill: "filled",
    label: undefined,
    placeholder: "Tell about brand guidelines, or your company policies",
  },
};

export const PlainFilledRounded: Story = {
  args: {
    variant: "plain",
    fill: "filled",
    shape: "rounded",
    label: undefined,
    placeholder: "Tell about brand guidelines, or your company policies",
  },
};

export const Underline: Story = {
  args: {
    variant: "plain",
    fill: "underline",
    label: undefined,
    placeholder: "Tell about brand guidelines, or your company policies",
  },
};

export const UnderlineWithError: Story = {
  args: {
    variant: "plain",
    fill: "underline",
    label: undefined,
    placeholder: "Tell about brand guidelines, or your company policies",
    error: "This field is required",
  },
};

// Showcase: multiple instances — args not applicable
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-6 w-100">
      <div className="flex flex-col gap-2">
        <p className="text-sm text-gray-3">Default (floating label)</p>
        <Textarea label="Your message" />
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-sm text-gray-3">Plain Filled</p>
        <Textarea
          variant="plain"
          fill="filled"
          placeholder="Tell about brand guidelines..."
        />
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-sm text-gray-3">Plain Filled Rounded</p>
        <Textarea
          variant="plain"
          fill="filled"
          shape="rounded"
          placeholder="Tell about brand guidelines..."
        />
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-sm text-gray-3">Underline</p>
        <Textarea
          variant="plain"
          fill="underline"
          placeholder="Tell about brand guidelines..."
        />
      </div>
    </div>
  ),
};
