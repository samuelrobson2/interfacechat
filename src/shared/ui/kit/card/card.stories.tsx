import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "@/shared/ui/kit/button";
import { Badge } from "@/shared/ui/kit/badge";
import {
  Card,
  CardImage,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
} from ".";

const PLACEHOLDER_IMG = "https://picsum.photos/seed/pharos-card/600/400";

// Shared body content used across all card stories
const SampleBody = ({ title = "Card Title" }: { title?: string }) => (
  <>
    <CardTitle>{title}</CardTitle>
    <CardDescription>
      Sample description text for this card variant.
    </CardDescription>
  </>
);

import type { VariantProps } from "class-variance-authority";
import { cardImageVariants } from ".";

type CardStoryArgs = React.ComponentProps<typeof Card> & {
  imageRatio?: VariantProps<typeof cardImageVariants>["ratio"];
  imageShape?: VariantProps<typeof cardImageVariants>["shape"];
};

const meta: Meta<CardStoryArgs> = {
  title: "UI/Kit/Card",
  component: Card,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "ghost", "outlined", "filled"],
    },
    shape: { control: "select", options: ["square", "rounded"] },
    orientation: { control: "radio", options: ["vertical", "horizontal"] },
    spacing: { control: "select", options: ["none", "md"] },
    highlight: { control: "boolean" },
    imageRatio: {
      control: "select",
      options: ["landscape", "square", "portrait"],
      description: "Aspect ratio of the CardImage",
    },
    imageShape: {
      control: "select",
      options: ["square", "rounded"],
      description: "Border radius of the CardImage",
    },
  },
  args: {
    variant: "ghost",
    shape: "square",
    orientation: "vertical",
    spacing: "none",
    highlight: false,
    imageRatio: "landscape",
    imageShape: "square",
  },
  render: (args) => {
    const isHorizontal = args.orientation === "horizontal";
    return (
      <Card className={isHorizontal ? "w-96" : "w-72"} {...args}>
        <CardImage
          src={PLACEHOLDER_IMG}
          alt="Sample"
          ratio={args.imageRatio}
          shape={args.imageShape}
          className={isHorizontal ? "w-[120px] shrink-0" : undefined}
        />
        <CardContent className="flex-col p-3">
          <SampleBody />
        </CardContent>
      </Card>
    );
  },
};

export default meta;
type Story = StoryObj<CardStoryArgs>;

// --- Basic variants ---

export const Default: Story = {
  args: { variant: "default", spacing: "md" },
};

export const Ghost: Story = {
  args: { variant: "ghost", spacing: "none" },
};

export const Outlined: Story = {
  args: { variant: "outlined", spacing: "none" },
};

export const OutlinedSpacingMd: Story = {
  args: { variant: "outlined", spacing: "md" },
};

export const Filled: Story = {
  args: { variant: "filled", spacing: "none" },
};

export const FilledSpacingMd: Story = {
  args: { variant: "filled", spacing: "md" },
};

export const RoundedShape: Story = {
  args: {
    variant: "outlined",
    shape: "rounded",
    spacing: "none",
    imageShape: "rounded",
  },
  render: (args) => (
    <Card className="w-72" {...args}>
      <CardImage
        src={PLACEHOLDER_IMG}
        alt="Sample"
        ratio={args.imageRatio}
        shape={args.imageShape}
      />
      <CardContent className="flex-col p-3">
        <SampleBody />
      </CardContent>
    </Card>
  ),
};

export const Highlighted: Story = {
  args: { variant: "default", spacing: "md", highlight: true },
  render: (args) => (
    <Card className="w-80" {...args}>
      <CardHeader>
        <CardTitle>Highlighted Card</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription>
          Blue highlight border and shadow effect.
        </CardDescription>
      </CardContent>
    </Card>
  ),
};

// --- Orientation ---

export const HorizontalGhost: Story = {
  args: { variant: "ghost", spacing: "none", orientation: "horizontal" },
};

export const HorizontalOutlined: Story = {
  args: { variant: "outlined", spacing: "md", orientation: "horizontal" },
};

export const HorizontalFilled: Story = {
  args: { variant: "filled", spacing: "md", orientation: "horizontal" },
};

// --- Composition ---

export const WithFooter: Story = {
  args: { variant: "default", spacing: "md" },
  render: (args) => (
    <Card className="w-80" {...args}>
      <CardHeader>
        <CardTitle>Dataset Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription>
          Your dataset has been processed successfully and is ready for
          training.
        </CardDescription>
      </CardContent>
      <CardFooter className="gap-2">
        <Button variant="primary" size="48">
          Start training
        </Button>
        <Button variant="secondary" size="48">
          View details
        </Button>
      </CardFooter>
    </Card>
  ),
};

export const WithAction: Story = {
  args: { variant: "default", spacing: "md" },
  render: (args) => (
    <Card className="w-80" {...args}>
      <CardHeader>
        <CardTitle>Active Dataset</CardTitle>
        <CardAction>
          <Badge size="sm">
            Live
          </Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        <CardDescription>1,240 rows · Updated 2 hours ago</CardDescription>
      </CardContent>
    </Card>
  ),
};

// --- Showcases ---

// Showcase: multiple instances — args not applicable
export const ImageRatios: Story = {
  render: () => (
    <div className="flex gap-4 items-start">
      {(["landscape", "square", "portrait"] as const).map((ratio) => (
        <Card key={ratio} className="w-56" variant="ghost" spacing="none">
          <CardImage src={PLACEHOLDER_IMG} alt={ratio} ratio={ratio} />
          <CardContent className="flex-col p-3">
            <SampleBody title={ratio} />
          </CardContent>
        </Card>
      ))}
    </div>
  ),
};

// Showcase: CardImage loading state across ratios
export const ImageLoading: Story = {
  render: () => (
    <div className="flex gap-4 items-start">
      {(["landscape", "square", "portrait"] as const).map((ratio) => (
        <Card key={ratio} className="w-56" variant="ghost" spacing="none">
          <CardImage ratio={ratio} isLoading />
          <CardContent className="flex-col p-3">
            <SampleBody title={`Loading / ${ratio}`} />
          </CardContent>
        </Card>
      ))}
    </div>
  ),
};

// Showcase: multiple instances — args not applicable
export const AllOrientations: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      {(["ghost", "outlined", "filled"] as const).map((variant) => (
        <div key={variant} className="flex gap-6 items-start">
          <Card className="w-64" variant={variant} spacing="none" orientation="vertical">
            <CardImage src={PLACEHOLDER_IMG} alt="vertical" ratio="landscape" />
            <CardContent className="flex-col p-3">
              <SampleBody title={`${variant} / vertical`} />
            </CardContent>
          </Card>
          <Card
            className="w-96"
            variant={variant}
            spacing={variant === "ghost" ? "none" : "md"}
            orientation="horizontal"
          >
            <CardImage
              src={PLACEHOLDER_IMG}
              alt="horizontal"
              ratio="square"
              className="w-[120px] shrink-0"
            />
            <CardContent className="flex-col p-3">
              <SampleBody title={`${variant} / horizontal`} />
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  ),
};

// Showcase: multiple instances — args not applicable
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-10">
      {(["ghost", "outlined", "filled"] as const).map((variant) => (
        <div key={variant} className="flex flex-col gap-4">
          <div className="flex gap-4 items-start">
            {(["square", "rounded"] as const).map((shape) => (
              <div key={shape} className="flex gap-4 items-start">
                {(["none", "md"] as const).map((spacing) => (
                  <Card
                    key={`${variant}-${shape}-${spacing}`}
                    className="w-56"
                    variant={variant}
                    shape={shape}
                    spacing={spacing}
                  >
                    <CardImage
                      src={PLACEHOLDER_IMG}
                      alt="sample"
                      ratio="landscape"
                      shape={shape}
                    />
                    <CardContent className="flex-col p-3">
                      <SampleBody
                        title={`${variant} / ${shape} / ${spacing}`}
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  ),
};
