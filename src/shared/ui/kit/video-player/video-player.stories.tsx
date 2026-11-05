import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  VideoPlayer,
  VideoMainController,
  VideoControls,
} from ".";

const DEMO_VIDEO = "https://files.vidstack.io/sprite-fight/720p.mp4";
const DEMO_POSTER = "https://files.vidstack.io/sprite-fight/poster.webp";
const DEMO_THUMBNAILS =
  "https://files.vidstack.io/sprite-fight/thumbnails.vtt";

const meta: Meta<typeof VideoPlayer> = {
  title: "UI/Kit/VideoPlayer",
  component: VideoPlayer,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[844px]">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    src: { control: "text", description: "Video source URL" },
    poster: { control: "text", description: "Poster image URL" },
    title: { control: "text", description: "Video title displayed in controls" },
    subtitle: {
      control: "text",
      description: "Subtitle text displayed below title",
    },
    thumbnails: {
      control: "text",
      description: "VTT URL for thumbnail previews on seek",
    },
  },
  args: {
    src: DEMO_VIDEO,
    poster: DEMO_POSTER,
    title: "Sprite Fight",
    subtitle: "Episode 1",
  },
};

export default meta;
type Story = StoryObj<typeof VideoPlayer>;

export const Default: Story = {};

export const WithThumbnails: Story = {
  args: {
    thumbnails: DEMO_THUMBNAILS,
    title: "Sprite Fight",
    subtitle: "With thumbnail preview on seek",
  },
};

export const NoTitleOrSubtitle: Story = {
  args: {
    title: undefined,
    subtitle: undefined,
  },
};

export const WithMoreButton: Story = {
  args: {
    title: "Sprite Fight",
    subtitle: "With More button",
    onMoreClick: () => alert("More clicked"),
  },
};

export const CustomLayout: Story = {
  args: {
    title: "Custom Layout",
  },
  render: (args) => (
    <VideoPlayer src={args.src} poster={args.poster} className={args.className}>
      <VideoMainController />
      <VideoControls
        title={args.title}
        subtitle={args.subtitle}
        thumbnails={args.thumbnails}
      />
    </VideoPlayer>
  ),
};
