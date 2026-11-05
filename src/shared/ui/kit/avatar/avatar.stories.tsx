import type { Meta, StoryObj } from "@storybook/react-vite";
import { Avatar, AvatarFallback, AvatarImage } from ".";
import notionImage from "@/shared/assets/images/notion.svg";
import linkedinImage from "@/shared/assets/images/linkedin.svg";

const meta: Meta<typeof Avatar> = {
  title: "UI/Kit/Avatar",
  component: Avatar,
  tags: ["autodocs"],
  argTypes: {
    // Avatar Root (Radix) has no special props — size is controlled via className
    className: {
      control: "select",
      options: ["size-6", "size-8", "size-10", "size-12", "size-14"],
      description: "Controls the avatar size",
    },
  },
  args: {
    className: "size-8",
  },
};

export default meta;
type Story = StoryObj<typeof Avatar>;

export const WithImage: Story = {
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage src={notionImage} alt="User avatar" />
      <AvatarFallback userName="John Doe" />
    </Avatar>
  ),
};

export const WithFallbackInitial: Story = {
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage src="/broken-image.jpg" alt="User avatar" />
      <AvatarFallback userName="Alice Johnson" />
    </Avatar>
  ),
};

export const WithCustomFallback: Story = {
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage src="/broken-image.jpg" alt="User avatar" />
      <AvatarFallback>?</AvatarFallback>
    </Avatar>
  ),
};

// delayMs on AvatarFallback controls how long to wait before showing fallback.
// Useful for slow connections — prevents a flash of fallback on fast loads.
export const WithFallbackDelay: Story = {
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage src="/broken-image.jpg" alt="User avatar" />
      <AvatarFallback delayMs={600} userName="Delayed Fallback" />
    </Avatar>
  ),
};

// Showcase: multiple sizes — className arg does not apply here
export const Sizes: Story = {
  render: () => (
    <div className="flex items-end gap-4">
      <Avatar className="size-6">
        <AvatarImage src="/broken-image.jpg" alt="User avatar" />
        <AvatarFallback userName="Alice" />
      </Avatar>
      <Avatar className="size-8">
        <AvatarImage src="/broken-image.jpg" alt="User avatar" />
        <AvatarFallback userName="Bob" />
      </Avatar>
      <Avatar className="size-10">
        <AvatarImage src="/broken-image.jpg" alt="User avatar" />
        <AvatarFallback userName="Carol" />
      </Avatar>
      <Avatar className="size-12">
        <AvatarImage src="/broken-image.jpg" alt="User avatar" />
        <AvatarFallback userName="Dave" />
      </Avatar>
    </div>
  ),
};

// Showcase: avatar group layout — className arg does not apply here
export const Group: Story = {
  render: () => (
    <div className="flex -space-x-2">
      <Avatar className="border-2 border-background-primary">
        <AvatarImage src={notionImage} alt="User 1" />
        <AvatarFallback userName="Alice" />
      </Avatar>
      <Avatar className="border-2 border-background-primary">
        <AvatarImage src={linkedinImage} alt="User 2" />
        <AvatarFallback userName="Bob" />
      </Avatar>
      <Avatar className="border-2 border-background-primary">
        <AvatarImage src="/broken-image.jpg" alt="User 3" />
        <AvatarFallback userName="Carol" />
      </Avatar>
    </div>
  ),
};
