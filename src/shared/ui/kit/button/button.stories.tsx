import type { Meta, StoryObj } from "@storybook/react-vite";
import { SearchIcon } from "@/shared/assets/icons/general/Search";
import { TrashFilledIcon } from "@/shared/assets/icons/general/TrashFilled";
import { Button } from ".";

const meta: Meta<typeof Button> = {
  title: "UI/Kit/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: [
        "primary",
        "secondary",
        "tertiary",
        "link",
        "link-destructive",
        "ghost",
        "icon-button",
        "destructive",
        "black",
        "blue",
      ],
    },
    size: {
      control: "select",
      options: ["56", "48", "40", "icon", "icon-md", "icon-sm"],
    },
    radius: {
      control: "select",
      options: ["default", "rounded"],
    },
    isLoading: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  args: {
    children: "Button",
    variant: "primary",
    size: "56",
    radius: "default",
    isLoading: false,
    disabled: false,
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: { variant: "primary" },
};

export const Secondary: Story = {
  args: { variant: "secondary" },
};

export const Tertiary: Story = {
  args: { variant: "tertiary" },
};

export const Link: Story = {
  args: { variant: "link" },
};

export const LinkWithIcon: Story = {
  args: {
    variant: "link",
    children: (
      <>
        <SearchIcon pathClasses="stroke-current" />
        Search
      </>
    ),
  },
};

export const LinkDestructive: Story = {
  args: { variant: "link-destructive", children: "Delete item" },
};

export const Ghost: Story = {
  args: { variant: "ghost" },
};

export const Destructive: Story = {
  args: { variant: "destructive", children: "Delete" },
};

export const Black: Story = {
  args: { variant: "black" },
};

export const BlackDisabled: Story = {
  args: { variant: "black", disabled: true },
};

export const BlackLoading: Story = {
  args: { variant: "black", isLoading: true },
};

export const Blue: Story = {
  args: { variant: "blue" },
};

export const BlueDisabled: Story = {
  args: { variant: "blue", disabled: true },
};

export const BlueLoading: Story = {
  args: { variant: "blue", isLoading: true },
};

export const WithIcon: Story = {
  args: {
    variant: "primary",
    children: (
      <>
        <SearchIcon pathClasses="stroke-current" />
        Search
      </>
    ),
  },
};

export const IconOnly: Story = {
  args: {
    variant: "icon-button",
    size: "icon",
    children: <TrashFilledIcon pathClasses="fill-current" />,
  },
};

export const Size56: Story = {
  args: { variant: "primary", size: "56" },
};

export const Size48: Story = {
  args: { variant: "primary", size: "48" },
};

export const Size40: Story = {
  args: { variant: "primary", size: "40" },
};

export const Loading: Story = {
  args: { variant: "primary", isLoading: true },
};

export const Disabled: Story = {
  args: { variant: "primary", disabled: true },
};

export const RadiusRounded: Story = {
  args: { variant: "primary", radius: "rounded" },
};

// Showcase: multiple instances - args not applicable
export const AllRadiusVariants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4 p-4">
      <Button variant="primary" radius="default">Default radius</Button>
      <Button variant="primary" radius="rounded">Rounded radius</Button>
      <Button variant="black" radius="default">Black default</Button>
      <Button variant="black" radius="rounded">Black rounded</Button>
      <Button variant="blue" radius="default">Blue default</Button>
      <Button variant="blue" radius="rounded">Blue rounded</Button>
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4 p-4">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="tertiary">Tertiary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="link">Link</Button>
      <Button variant="link-destructive">Link Destructive</Button>
      <Button variant="black">Black</Button>
      <Button variant="blue">Blue</Button>
      <Button variant="icon-button" size="icon">
        <SearchIcon pathClasses="stroke-current" />
      </Button>
    </div>
  ),
};
