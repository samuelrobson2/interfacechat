import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  ImageGrid,
  ImageGridItem,
  ImageGridItemCaption,
  ImageGridItemImage,
} from ".";
import { Text } from "../text";

const meta: Meta<typeof ImageGrid> = {
  title: "UI/Kit/ImageGrid",
  component: ImageGrid,
  tags: ["autodocs"],
  argTypes: {
    columns: {
      control: { type: "number", min: 1, max: 6 },
      description: "Number of columns (6 max)",
    },
    columnGap: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Gap between columns",
      table: { defaultValue: { summary: "md" } },
    },
    rowGap: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Gap between rows",
      table: { defaultValue: { summary: "lg" } },
    },
  },
  args: {
    columns: 3,
    columnGap: "md",
    rowGap: "lg",
  },
};

export default meta;
type Story = StoryObj<typeof ImageGrid>;

const IMAGES = [
  "https://picsum.photos/seed/a1/600/600",
  "https://picsum.photos/seed/b2/600/600",
  "https://picsum.photos/seed/c3/600/600",
  "https://picsum.photos/seed/d4/600/600",
  "https://picsum.photos/seed/e5/600/600",
  "https://picsum.photos/seed/f6/600/600",
  "https://picsum.photos/seed/g7/600/600",
  "https://picsum.photos/seed/h8/600/600",
  "https://picsum.photos/seed/i9/600/600",
];

export const Default: Story = {
  render: (args) => (
    <ImageGrid className="w-[900px]" {...args}>
      {IMAGES.map((src, i) => (
        <ImageGridItem key={src}>
          <ImageGridItemImage
            src={src}
            alt={`Image ${i + 1}`}
            orientation="square"
          />
        </ImageGridItem>
      ))}
    </ImageGrid>
  ),
};

export const WithCaptions: Story = {
  render: (args) => (
    <ImageGrid className="w-[900px]" {...args}>
      {IMAGES.map((src, i) => (
        <ImageGridItem key={src}>
          <ImageGridItemImage
            src={src}
            alt={`Image ${i + 1}`}
            orientation="square"
          />
          <ImageGridItemCaption
            title={`Image ${i + 1}`}
            description="Sample description text"
          />
        </ImageGridItem>
      ))}
    </ImageGrid>
  ),
};

export const MixedOrientations: Story = {
  render: (args) => (
    <ImageGrid className="w-[900px]" {...args}>
      {[
        {
          src: IMAGES[0],
          orientation: "landscape" as const,
          title: "Landscape",
        },
        { src: IMAGES[1], orientation: "portrait" as const, title: "Portrait" },
        { src: IMAGES[2], orientation: "square" as const, title: "Square" },
        { src: IMAGES[3], orientation: "square" as const, title: "Square" },
        {
          src: IMAGES[4],
          orientation: "landscape" as const,
          title: "Landscape",
        },
        { src: IMAGES[5], orientation: "portrait" as const, title: "Portrait" },
        {
          src: IMAGES[6],
          orientation: "landscape" as const,
          title: "Landscape",
        },
        { src: IMAGES[7], orientation: "square" as const, title: "Square" },
      ].map(({ src, orientation, title }) => (
        <ImageGridItem key={src}>
          <ImageGridItemImage src={src} alt={title} orientation={orientation} />
          <ImageGridItemCaption title={title} />
        </ImageGridItem>
      ))}
    </ImageGrid>
  ),
};

export const ColumnVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-8 w-[900px]">
      {([2, 3, 4] as const).map((cols) => (
        <div key={cols} className="flex flex-col gap-2">
          <Text variant="label" color="secondary">
            {cols} columns
          </Text>
          <ImageGrid columns={cols} rowGap="md">
            {IMAGES.slice(0, cols).map((src, i) => (
              <ImageGridItem key={src}>
                <ImageGridItemImage
                  src={src}
                  alt={`Image ${i + 1}`}
                  orientation="square"
                />
              </ImageGridItem>
            ))}
          </ImageGrid>
        </div>
      ))}
    </div>
  ),
};
