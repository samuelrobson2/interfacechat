import type { Meta, StoryObj } from "@storybook/react-vite";
import { StarIcon } from "@/shared/assets/icons/general/Star";
import { Badge } from ".";

const meta: Meta<typeof Badge> = {
  title: "UI/Kit/Badge",
  component: Badge,
  tags: ["autodocs"],
  argTypes: {
    color: {
      control: "select",
      options: ["default", "ghost", "neutral", "accent"],
    },
    size: {
      control: "select",
      options: ["default", "md", "sm", "icon"],
    },
    radius: {
      control: "select",
      options: ["square"],
    },
    closable: { control: "boolean" },
  },
  args: {
    children: "Badge",
    color: "default",
    size: "default",
    closable: false,
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {
  args: { color: "default" },
};

export const Ghost: Story = {
  args: { color: "ghost" },
};

export const Neutral: Story = {
  args: { color: "neutral" },
};

export const Accent: Story = {
  args: { color: "accent" },
};

export const SquareRadius: Story = {
  args: { color: "default", radius: "square" },
};

export const Closable: Story = {
  args: {
    color: "default",
    closable: true,
    children: "Removable tag",
  },
};

export const WithIcon: Story = {
  args: { color: "default" },
  render: (args) => (
    <Badge {...args}>
      <StarIcon className="size-4" pathClasses="stroke-current" />
      Featured
    </Badge>
  ),
};

export const IconOnly: Story = {
  args: { size: "icon", color: "default" },
  render: (args) => (
    <Badge {...args}>
      <StarIcon className="size-4" pathClasses="stroke-current" />
    </Badge>
  ),
};

// Showcase: multiple instances — args not applicable
export const AllColorsWithIcon: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Badge color="default">
        <StarIcon className="size-4" pathClasses="stroke-current" />
        Default
      </Badge>
      <Badge color="ghost">
        <StarIcon className="size-4" pathClasses="stroke-current" />
        Ghost
      </Badge>
      <Badge color="neutral">
        <StarIcon className="size-4" pathClasses="stroke-current" />
        Neutral
      </Badge>
      <Badge color="accent">
        <StarIcon className="size-4" pathClasses="stroke-current" />
        Accent
      </Badge>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Badge size="default">Default</Badge>
      <Badge size="md">Medium</Badge>
      <Badge size="sm">Small</Badge>
    </div>
  ),
};

export const AllColors: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Badge color="default">Default</Badge>
      <Badge color="ghost">Ghost</Badge>
      <Badge color="neutral">Neutral</Badge>
      <Badge color="accent">Accent</Badge>
    </div>
  ),
};

export const AllColorsSquare: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Badge color="default" radius="square">Default</Badge>
      <Badge color="ghost" radius="square">Ghost</Badge>
      <Badge color="neutral" radius="square">Neutral</Badge>
      <Badge color="accent" radius="square">Accent</Badge>
    </div>
  ),
};
