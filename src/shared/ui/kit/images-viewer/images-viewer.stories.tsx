import type { Meta, StoryObj } from "@storybook/react-vite";
import { ImagesViewer, ImagesViewerLightboxTopActions } from ".";

const meta: Meta<typeof ImagesViewer> = {
  title: "UI/Kit/ImagesViewer",
  component: ImagesViewer,
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Thumbnail size in the inline row",
      table: { defaultValue: { summary: "sm" } },
    },
    images: {
      description:
        "Array of image objects with src, optional alt, optional isLoading, and optional attachmentId",
    },
    imageClassName: {
      control: "text",
      description: "Extra CSS classes applied to each thumbnail image / skeleton",
    },
    skeletonClassName: {
      control: "text",
      description: "Extra CSS classes applied to skeleton placeholders",
    },
    children: {
      control: false,
      description:
        "Optional compound slot children passed to the embedded lightbox (e.g. <ImagesViewerLightboxTopActions>)",
    },
  },
  args: {
    size: "sm",
  },
};

export default meta;
type Story = StoryObj<typeof ImagesViewer>;

const PHOTO_IMAGES = [
  { src: "https://picsum.photos/seed/p1/1280/960", alt: "Photo 1 — 4:3" },
  { src: "https://picsum.photos/seed/p2/1920/1080", alt: "Photo 2 — 16:9" },
  { src: "https://picsum.photos/seed/p3/1024/768", alt: "Photo 3 — 4:3" },
  { src: "https://picsum.photos/seed/p4/1600/900", alt: "Photo 4 — 16:9" },
  { src: "https://picsum.photos/seed/p5/1280/800", alt: "Photo 5 — 16:10" },
  { src: "https://picsum.photos/seed/p6/2048/1365", alt: "Photo 6 — 3:2" },
  { src: "https://picsum.photos/seed/p7/1440/1080", alt: "Photo 7 — 4:3" },
];

const WIDESCREEN_IMAGES = [
  { src: "https://picsum.photos/seed/w1/1920/1080", alt: "Full HD" },
  { src: "https://picsum.photos/seed/w2/2560/1440", alt: "2K" },
  { src: "https://picsum.photos/seed/w3/1366/768", alt: "Laptop screen" },
  { src: "https://picsum.photos/seed/w4/1600/900", alt: "16:9 medium" },
  { src: "https://picsum.photos/seed/w5/3840/2160", alt: "4K" },
];

const PORTRAIT_IMAGES = [
  { src: "https://picsum.photos/seed/pr1/864/1080", alt: "4:5 social" },
  { src: "https://picsum.photos/seed/pr2/720/1280", alt: "9:16 story" },
  { src: "https://picsum.photos/seed/pr3/1080/1350", alt: "4:5 tall" },
  { src: "https://picsum.photos/seed/pr4/600/900", alt: "2:3 print" },
];

const SQUARE_IMAGES = [
  { src: "https://picsum.photos/seed/sq1/1080/1080", alt: "1080px" },
  { src: "https://picsum.photos/seed/sq2/512/512", alt: "512px" },
  { src: "https://picsum.photos/seed/sq3/2048/2048", alt: "2048px" },
  { src: "https://picsum.photos/seed/sq4/800/800", alt: "800px" },
  { src: "https://picsum.photos/seed/sq5/1440/1440", alt: "1440px" },
];

export const SizeSmall: Story = {
  name: "Size — sm (default)",
  args: {
    size: "sm",
    images: PHOTO_IMAGES,
  },
};

export const SizeMedium: Story = {
  name: "Size — md",
  args: {
    size: "md",
    images: WIDESCREEN_IMAGES,
  },
};

export const SizeLarge: Story = {
  name: "Size — lg",
  args: {
    size: "lg",
    images: PORTRAIT_IMAGES,
  },
};

export const SingleImage: Story = {
  args: {
    size: "sm",
    images: PHOTO_IMAGES.slice(0, 1),
  },
};

export const SquareThumbnails: Story = {
  args: {
    size: "md",
    images: SQUARE_IMAGES,
  },
};

export const OverflowCounter: Story = {
  name: "Overflow — auto +N counter",
  args: {
    size: "sm",
    images: PHOTO_IMAGES,
  },
  decorators: [
    (Story) => (
      <div style={{ width: 500 }}>
        <Story />
      </div>
    ),
  ],
};

export const CustomImageClass: Story = {
  name: "Custom imageClassName",
  args: {
    size: "lg",
    images: PHOTO_IMAGES.slice(0, 2),
    imageClassName: "rounded-[16px]",
  },
};

export const LoadingSkeletons: Story = {
  name: "Loading — skeleton placeholders",
  args: {
    size: "lg",
    images: [
      { src: "", alt: "Loading 1", isLoading: true },
      { src: "", alt: "Loading 2", isLoading: true },
      { src: "", alt: "Loading 3", isLoading: true },
    ],
  },
};

export const MixedLoadingAndLoaded: Story = {
  name: "Mixed — loaded + loading",
  args: {
    size: "md",
    images: [
      { src: "https://picsum.photos/seed/mix1/1280/960", alt: "Loaded" },
      { src: "", alt: "Still loading", isLoading: true },
      { src: "https://picsum.photos/seed/mix3/1024/768", alt: "Loaded too" },
    ],
  },
};

export const CompositionWithCustomTopActions: Story = {
  name: "Composition — custom top actions",
  args: {
    size: "md",
    images: PHOTO_IMAGES.slice(0, 3),
  },
  render: (args) => (
    <ImagesViewer {...args}>
      <ImagesViewerLightboxTopActions>
        <button
          type="button"
          onClick={() => console.info("Custom action clicked")}
          className="inline-flex h-9 items-center justify-center rounded-[60px] border border-stroke-secondary bg-background-secondary px-3 cursor-pointer hover:bg-gray-6"
        >
          Share
        </button>
      </ImagesViewerLightboxTopActions>
    </ImagesViewer>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      {(["sm", "md", "lg"] as const).map((size) => (
        <div key={size} className="flex flex-col gap-1">
          <span className="text-xs text-typography-secondary font-mono">
            size=&quot;{size}&quot;
          </span>
          <ImagesViewer size={size} images={PHOTO_IMAGES.slice(0, 4)} />
        </div>
      ))}
    </div>
  ),
};
