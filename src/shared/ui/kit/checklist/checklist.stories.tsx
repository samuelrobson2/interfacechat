import type { Meta, StoryObj } from "@storybook/react-vite";
import { Text } from "../text";
import { Checklist } from ".";

const meta: Meta<typeof Checklist> = {
  title: "UI/Kit/Checklist",
  component: Checklist,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Checklist>;

export const TextItems: Story = {
  args: {
    items: [
      "Complete project setup",
      "Design component API",
      "Implement checklist",
      "Write documentation",
    ],
    renderItem: (item) => <Text as="span">{item as string}</Text>,
  },
};

export const ImageItems: Story = {
  args: {
    items: [
      "https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=240&h=240&fit=crop",
      "https://images.unsplash.com/photo-1682695797221-8164ff1fafc9?w=240&h=240&fit=crop",
      "https://images.unsplash.com/photo-1682686581580-d99b0230064e?w=240&h=240&fit=crop",
      "https://images.unsplash.com/photo-1694537745985-34eaf75e41e4?w=240&h=240&fit=crop",
    ],
    renderItem: (item) => (
      <img
        src={item as string}
        alt=""
        className="size-[120px] shrink-0 rounded-[4px] object-cover"
        draggable={false}
      />
    ),
  },
};

// Showcase: both variants side-by-side
export const BothVariants: Story = {
  render: () => (
    <div className="flex gap-10">
      <Checklist
        items={["Task one", "Task two", "Task three", "Task four"]}
        renderItem={(item) => <Text as="span">{item}</Text>}
      />
      <Checklist
        items={[
          "https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=240&h=240&fit=crop",
          "https://images.unsplash.com/photo-1682695797221-8164ff1fafc9?w=240&h=240&fit=crop",
          "https://images.unsplash.com/photo-1682686581580-d99b0230064e?w=240&h=240&fit=crop",
        ]}
        renderItem={(url) => (
          <img
            src={url}
            alt=""
            className="size-[120px] shrink-0 rounded-[4px] object-cover"
            draggable={false}
          />
        )}
      />
    </div>
  ),
};

export const PreSelected: Story = {
  args: {
    items: ["Already done", "In progress", "Not started", "Skipped"],
    values: [true, true, false, false],
    renderItem: (item) => <Text as="span">{item as string}</Text>,
  },
};
