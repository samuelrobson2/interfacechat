import type { Meta, StoryObj } from "@storybook/react-vite";
import { EyeIcon } from "@/shared/assets/icons/general/Eye";
import { SearchIcon } from "@/shared/assets/icons/general/Search";
import { Input } from ".";

const meta: Meta<typeof Input> = {
  title: "UI/Kit/Input",
  component: Input,
  tags: ["autodocs"],
  argTypes: {
    label: {
      control: "text",
      description: "Floating label text",
    },
    error: {
      control: "text",
      description: "Error message shown below the input",
    },
    isError: {
      control: "boolean",
      description: "Shows error border without a message",
    },
    disabled: {
      control: "boolean",
    },
    type: {
      control: "select",
      options: ["text", "password", "email", "number", "search"],
    },
    fill: {
      control: "select",
      options: ["default", "outlined", "filled", "underline"],
      description: "Visual fill style",
    },
    variant: {
      control: "select",
      options: ["floating", "labeled", "plain"],
      description: "Label layout variant",
    },
    shape: {
      control: "select",
      options: ["square", "rounded"],
      description: "Border radius shape",
    },
    leftElement: {
      control: "text",
      description: "Left element to display in the input",
    },
    rightElement: {
      control: "text",
      description: "Right element to display in the input",
    },
    placeholder: {
      control: "text",
      description: "Placeholder text",
    },
  },
  args: {
    label: "Label",
    disabled: false,
    isError: false,
    type: "text",
    variant: "floating",
    shape: "square",
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

// ─── Legacy (current) ────────────────────────────────────────

export const Default: Story = {};

export const WithError: Story = {
  args: {
    label: "Email",
    error: "This field is required",
  },
};

export const ErrorState: Story = {
  args: {
    label: "Email",
    isError: true,
  },
};

export const Disabled: Story = {
  args: {
    label: "Username",
    disabled: true,
    defaultValue: "john.doe",
  },
};

export const PasswordType: Story = {
  args: {
    label: "Password",
    type: "password",
  },
};

export const WithLeftElement: Story = {
  args: { label: "Search" },
  render: (args) => (
    <Input
      {...args}
      leftElement={
        <SearchIcon className="size-5" pathClasses="stroke-icon-secondary" />
      }
    />
  ),
};

export const WithRightElement: Story = {
  args: { label: "Password", type: "password" },
  render: (args) => (
    <Input
      {...args}
      placeholder="Password"
      rightElement={
        <EyeIcon
          className="size-5 cursor-pointer"
          pathClasses="stroke-icon-secondary"
        />
      }
    />
  ),
};

export const WithBothElements: Story = {
  args: { label: "Search" },
  render: (args) => (
    <Input
      {...args}
      leftElement={
        <SearchIcon className="size-5" pathClasses="stroke-icon-secondary" />
      }
      rightElement={
        <EyeIcon
          className="size-5 cursor-pointer"
          pathClasses="stroke-icon-secondary"
        />
      }
    />
  ),
};

// Showcase: multiple instances — args not applicable
export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-80">
      <Input label="Default" />
      <Input label="With value" defaultValue="Some value" />
      <Input label="Disabled" disabled defaultValue="Disabled value" />
      <Input label="Error" error="This field is required" />
      <Input label="Error state only" isError />
    </div>
  ),
};

// ─── Floating + Outlined ─────────────────────────────────────

export const FloatingOutlined: Story = {
  args: { label: "Title", fill: "outlined" },
  render: (args) => (
    <Input
      {...args}
      rightElement={
        <EyeIcon
          className="size-5 cursor-pointer"
          pathClasses="stroke-icon-secondary"
        />
      }
    />
  ),
};

export const FloatingOutlinedRounded: Story = {
  args: { label: "Title", fill: "outlined", shape: "rounded" },
  render: (args) => (
    <Input
      {...args}
      rightElement={
        <EyeIcon
          className="size-5 cursor-pointer"
          pathClasses="stroke-icon-secondary"
        />
      }
    />
  ),
};

// ─── Floating + Filled ───────────────────────────────────────

export const FloatingFilled: Story = {
  args: { label: "Title", fill: "filled" },
  render: (args) => (
    <Input
      {...args}
      rightElement={
        <EyeIcon
          className="size-5 cursor-pointer"
          pathClasses="stroke-icon-secondary"
        />
      }
    />
  ),
};

export const FloatingFilledRounded: Story = {
  args: { label: "Title", fill: "filled", shape: "rounded" },
  render: (args) => (
    <Input
      {...args}
      rightElement={
        <EyeIcon
          className="size-5 cursor-pointer"
          pathClasses="stroke-icon-secondary"
        />
      }
    />
  ),
};

// ─── Labeled + Outlined ──────────────────────────────────────

export const LabeledOutlined: Story = {
  args: {
    label: "Title",
    variant: "labeled",
    fill: "outlined",
    placeholder: "Placeholder text",
  },
  render: (args) => (
    <Input
      {...args}
      rightElement={
        <EyeIcon
          className="size-5 cursor-pointer"
          pathClasses="stroke-icon-secondary"
        />
      }
    />
  ),
};

export const LabeledOutlinedRounded: Story = {
  args: {
    label: "Title",
    variant: "labeled",
    fill: "outlined",
    shape: "rounded",
    placeholder: "Placeholder text",
  },
  render: (args) => (
    <Input
      {...args}
      rightElement={
        <EyeIcon
          className="size-5 cursor-pointer"
          pathClasses="stroke-icon-secondary"
        />
      }
    />
  ),
};

// ─── Labeled + Filled ────────────────────────────────────────

export const LabeledFilled: Story = {
  args: {
    label: "Title",
    variant: "labeled",
    fill: "filled",
    placeholder: "Placeholder text",
  },
  render: (args) => (
    <Input
      {...args}
      rightElement={
        <EyeIcon
          className="size-5 cursor-pointer"
          pathClasses="stroke-icon-secondary"
        />
      }
    />
  ),
};

export const LabeledFilledRounded: Story = {
  args: {
    label: "Title",
    variant: "labeled",
    fill: "filled",
    shape: "rounded",
    placeholder: "Placeholder text",
  },
  render: (args) => (
    <Input
      {...args}
      rightElement={
        <EyeIcon
          className="size-5 cursor-pointer"
          pathClasses="stroke-icon-secondary"
        />
      }
    />
  ),
};

// ─── Plain + Outlined ────────────────────────────────────────

export const PlainOutlined: Story = {
  args: {
    variant: "plain",
    fill: "outlined",
    placeholder: "Placeholder text",
  },
  render: (args) => (
    <Input
      {...args}
      rightElement={
        <EyeIcon
          className="size-5 cursor-pointer"
          pathClasses="stroke-icon-secondary"
        />
      }
    />
  ),
};

export const PlainOutlinedRounded: Story = {
  args: {
    variant: "plain",
    fill: "outlined",
    shape: "rounded",
    placeholder: "Placeholder text",
  },
  render: (args) => (
    <Input
      {...args}
      rightElement={
        <EyeIcon
          className="size-5 cursor-pointer"
          pathClasses="stroke-icon-secondary"
        />
      }
    />
  ),
};

// ─── Plain + Filled ──────────────────────────────────────────

export const PlainFilled: Story = {
  args: {
    variant: "plain",
    fill: "filled",
    placeholder: "Placeholder text",
  },
  render: (args) => (
    <Input
      {...args}
      rightElement={
        <EyeIcon
          className="size-5 cursor-pointer"
          pathClasses="stroke-icon-secondary"
        />
      }
    />
  ),
};

export const PlainFilledRounded: Story = {
  args: {
    variant: "plain",
    fill: "filled",
    shape: "rounded",
    placeholder: "Placeholder text",
  },
  render: (args) => (
    <Input
      {...args}
      rightElement={
        <EyeIcon
          className="size-5 cursor-pointer"
          pathClasses="stroke-icon-secondary"
        />
      }
    />
  ),
};

// ─── Plain + Underline ───────────────────────────────────────

export const PlainUnderline: Story = {
  args: {
    variant: "plain",
    fill: "underline",
    placeholder: "Title",
  },
  render: (args) => (
    <Input
      {...args}
      rightElement={
        <EyeIcon
          className="size-5 cursor-pointer"
          pathClasses="stroke-icon-secondary"
        />
      }
    />
  ),
};

// ─── Showcase: All Variants ──────────────────────────────────

// Showcase: multiple instances — args not applicable
export const AllFloatingOutlined: Story = {
  render: () => (
    <div className="flex gap-8">
      <div className="flex flex-col gap-4 w-80">
        <p className="text-sm text-typography-secondary">Square</p>
        <Input label="Default" fill="outlined" />
        <Input label="With value" fill="outlined" defaultValue="Some value" />
        <Input label="Disabled" fill="outlined" disabled />
        <Input label="Error" fill="outlined" error="Error message" />
      </div>
      <div className="flex flex-col gap-4 w-80">
        <p className="text-sm text-typography-secondary">Rounded</p>
        <Input label="Default" fill="outlined" shape="rounded" />
        <Input
          label="With value"
          fill="outlined"
          shape="rounded"
          defaultValue="Some value"
        />
        <Input label="Disabled" fill="outlined" shape="rounded" disabled />
        <Input
          label="Error"
          fill="outlined"
          shape="rounded"
          error="Error message"
        />
      </div>
    </div>
  ),
};

// Showcase: multiple instances — args not applicable
export const AllFloatingFilled: Story = {
  render: () => (
    <div className="flex gap-8">
      <div className="flex flex-col gap-4 w-80">
        <p className="text-sm text-typography-secondary">Square</p>
        <Input label="Default" fill="filled" />
        <Input label="With value" fill="filled" defaultValue="Some value" />
        <Input label="Disabled" fill="filled" disabled />
        <Input label="Error" fill="filled" error="Error message" />
      </div>
      <div className="flex flex-col gap-4 w-80">
        <p className="text-sm text-typography-secondary">Rounded</p>
        <Input label="Default" fill="filled" shape="rounded" />
        <Input
          label="With value"
          fill="filled"
          shape="rounded"
          defaultValue="Some value"
        />
        <Input label="Disabled" fill="filled" shape="rounded" disabled />
        <Input
          label="Error"
          fill="filled"
          shape="rounded"
          error="Error message"
        />
      </div>
    </div>
  ),
};

// Showcase: multiple instances — args not applicable
export const AllLabeledOutlined: Story = {
  render: () => (
    <div className="flex gap-8">
      <div className="flex flex-col gap-4 w-80">
        <p className="text-sm text-typography-secondary">Square</p>
        <Input
          label="Title"
          variant="labeled"
          fill="outlined"
          placeholder="Placeholder text"
        />
        <Input
          label="Title"
          variant="labeled"
          fill="outlined"
          defaultValue="Filled value"
        />
        <Input
          label="Title"
          variant="labeled"
          fill="outlined"
          placeholder="Placeholder text"
          disabled
        />
        <Input
          label="Title"
          variant="labeled"
          fill="outlined"
          defaultValue="Error value"
          error="Error message"
        />
      </div>
      <div className="flex flex-col gap-4 w-80">
        <p className="text-sm text-typography-secondary">Rounded</p>
        <Input
          label="Title"
          variant="labeled"
          fill="outlined"
          shape="rounded"
          placeholder="Placeholder text"
        />
        <Input
          label="Title"
          variant="labeled"
          fill="outlined"
          shape="rounded"
          defaultValue="Filled value"
        />
        <Input
          label="Title"
          variant="labeled"
          fill="outlined"
          shape="rounded"
          placeholder="Placeholder text"
          disabled
        />
        <Input
          label="Title"
          variant="labeled"
          fill="outlined"
          shape="rounded"
          defaultValue="Error value"
          error="Error message"
        />
      </div>
    </div>
  ),
};

// Showcase: multiple instances — args not applicable
export const AllLabeledFilled: Story = {
  render: () => (
    <div className="flex gap-8">
      <div className="flex flex-col gap-4 w-80">
        <p className="text-sm text-typography-secondary">Square</p>
        <Input
          label="Title"
          variant="labeled"
          fill="filled"
          placeholder="Placeholder text"
        />
        <Input
          label="Title"
          variant="labeled"
          fill="filled"
          defaultValue="Filled value"
        />
        <Input
          label="Title"
          variant="labeled"
          fill="filled"
          placeholder="Placeholder text"
          disabled
        />
        <Input
          label="Title"
          variant="labeled"
          fill="filled"
          defaultValue="Error value"
          error="Error message"
        />
      </div>
      <div className="flex flex-col gap-4 w-80">
        <p className="text-sm text-typography-secondary">Rounded</p>
        <Input
          label="Title"
          variant="labeled"
          fill="filled"
          shape="rounded"
          placeholder="Placeholder text"
        />
        <Input
          label="Title"
          variant="labeled"
          fill="filled"
          shape="rounded"
          defaultValue="Filled value"
        />
        <Input
          label="Title"
          variant="labeled"
          fill="filled"
          shape="rounded"
          placeholder="Placeholder text"
          disabled
        />
        <Input
          label="Title"
          variant="labeled"
          fill="filled"
          shape="rounded"
          defaultValue="Error value"
          error="Error message"
        />
      </div>
    </div>
  ),
};

// Showcase: multiple instances — args not applicable
export const AllPlainOutlined: Story = {
  render: () => (
    <div className="flex gap-8">
      <div className="flex flex-col gap-4 w-80">
        <p className="text-sm text-typography-secondary">Square</p>
        <Input variant="plain" fill="outlined" placeholder="Placeholder text" />
        <Input variant="plain" fill="outlined" defaultValue="Filled value" />
        <Input
          variant="plain"
          fill="outlined"
          placeholder="Placeholder text"
          disabled
        />
        <Input
          variant="plain"
          fill="outlined"
          defaultValue="Error value"
          error="Error message"
        />
      </div>
      <div className="flex flex-col gap-4 w-80">
        <p className="text-sm text-typography-secondary">Rounded</p>
        <Input
          variant="plain"
          fill="outlined"
          shape="rounded"
          placeholder="Placeholder text"
        />
        <Input
          variant="plain"
          fill="outlined"
          shape="rounded"
          defaultValue="Filled value"
        />
        <Input
          variant="plain"
          fill="outlined"
          shape="rounded"
          placeholder="Placeholder text"
          disabled
        />
        <Input
          variant="plain"
          fill="outlined"
          shape="rounded"
          defaultValue="Error value"
          error="Error message"
        />
      </div>
    </div>
  ),
};

// Showcase: multiple instances — args not applicable
export const AllPlainFilled: Story = {
  render: () => (
    <div className="flex gap-8">
      <div className="flex flex-col gap-4 w-80">
        <p className="text-sm text-typography-secondary">Square</p>
        <Input variant="plain" fill="filled" placeholder="Placeholder text" />
        <Input variant="plain" fill="filled" defaultValue="Filled value" />
        <Input
          variant="plain"
          fill="filled"
          placeholder="Placeholder text"
          disabled
        />
        <Input
          variant="plain"
          fill="filled"
          defaultValue="Error value"
          error="Error message"
        />
      </div>
      <div className="flex flex-col gap-4 w-80">
        <p className="text-sm text-typography-secondary">Rounded</p>
        <Input
          variant="plain"
          fill="filled"
          shape="rounded"
          placeholder="Placeholder text"
        />
        <Input
          variant="plain"
          fill="filled"
          shape="rounded"
          defaultValue="Filled value"
        />
        <Input
          variant="plain"
          fill="filled"
          shape="rounded"
          placeholder="Placeholder text"
          disabled
        />
        <Input
          variant="plain"
          fill="filled"
          shape="rounded"
          defaultValue="Error value"
          error="Error message"
        />
      </div>
    </div>
  ),
};

// Showcase: multiple instances — args not applicable
export const AllPlainUnderline: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-80">
      <Input variant="plain" fill="underline" placeholder="Title" />
      <Input
        variant="plain"
        fill="underline"
        placeholder="Title"
        defaultValue="Filled value"
      />
      <Input variant="plain" fill="underline" placeholder="Title" disabled />
      <Input
        variant="plain"
        fill="underline"
        defaultValue="Error value"
        error="Error message"
      />
    </div>
  ),
};
