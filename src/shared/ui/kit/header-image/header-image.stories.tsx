import type { Meta, StoryObj } from "@storybook/react-vite";

import { HeaderImage } from ".";

const PLACEHOLDER_IMG = "https://picsum.photos/seed/pharos-card/1200/400";

const meta: Meta<typeof HeaderImage> = {
  title: "UI/Kit/HeaderImage",
  component: HeaderImage,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  argTypes: {
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Height of the header image",
    },
  },
  args: {
    size: "sm",
    src: PLACEHOLDER_IMG,
    alt: "Header image",
  },
};

export default meta;
type Story = StoryObj<typeof HeaderImage>;

export const Small: Story = {
  args: { size: "sm" },
};

export const Medium: Story = {
  args: { size: "md" },
};

export const Large: Story = {
  args: { size: "lg" },
};

// Showcase: all sizes side by side
export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-col gap-6 w-[856px]">
      {(["sm", "md", "lg"] as const).map((size) => (
        <div key={size} className="flex flex-col gap-2">
          <p className="text-[12px] text-typography-secondary uppercase tracking-wider">
            {size}
          </p>
          <HeaderImage
            src={PLACEHOLDER_IMG}
            size={size}
            alt={`${size} header`}
          />
        </div>
      ))}
    </div>
  ),
  parameters: { layout: "padded" },
};

export const Loading: Story = {
  args: { isLoading: true, src: undefined },
};

// Showcase: loading state across all sizes — 21:9 frame stays in place
export const LoadingAllSizes: Story = {
  render: () => (
    <div className="flex flex-col gap-6 w-[856px]">
      {(["sm", "md", "lg"] as const).map((size) => (
        <div key={size} className="flex flex-col gap-2">
          <p className="text-[12px] text-typography-secondary uppercase tracking-wider">
            {size}
          </p>
          <HeaderImage size={size} isLoading />
        </div>
      ))}
    </div>
  ),
  parameters: { layout: "padded" },
};
