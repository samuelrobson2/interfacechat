import type { Meta, StoryObj } from "@storybook/react-vite";
import { ScrollArea, ScrollBar } from ".";

const ITEMS = Array.from({ length: 30 }, (_, i) => `Item ${i + 1}`);
const COLUMNS = Array.from({ length: 20 }, (_, i) => `Column ${i + 1}`);

const meta: Meta<typeof ScrollArea> = {
  title: "UI/Kit/ScrollArea",
  component: ScrollArea,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ScrollArea>;

export const Vertical: Story = {
  render: () => (
    <ScrollArea className="h-64 w-48 rounded-[4px] border border-stroke-secondary">
      <div className="p-4">
        {ITEMS.map((item) => (
          <div
            key={item}
            className="py-2 border-b border-stroke-secondary last:border-b-0 text-sm text-typography-primary"
          >
            {item}
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
};

export const Horizontal: Story = {
  render: () => (
    <ScrollArea className="w-80 rounded-[4px] border border-stroke-secondary">
      <div className="flex gap-3 p-4">
        {COLUMNS.map((col) => (
          <div
            key={col}
            className="shrink-0 w-24 h-16 rounded-[4px] bg-background-secondary flex items-center justify-center text-sm text-typography-secondary"
          >
            {col}
          </div>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  ),
};

export const WithLongText: Story = {
  render: () => (
    <ScrollArea className="h-48 w-80 rounded-[4px] border border-stroke-secondary">
      <div className="p-4 text-sm text-typography-primary leading-relaxed">
        {Array.from({ length: 10 }, (_, i) => (
          <p key={i} className="mb-3">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.
          </p>
        ))}
      </div>
    </ScrollArea>
  ),
};

// Showcase: multiple instances — args not applicable
export const VerticalAndHorizontal: Story = {
  render: () => (
    <ScrollArea className="h-64 w-80 rounded-[4px] border border-stroke-secondary">
      <div className="p-4" style={{ width: 600 }}>
        {ITEMS.slice(0, 20).map((item) => (
          <div
            key={item}
            className="py-2 border-b border-stroke-secondary last:border-b-0 text-sm text-typography-primary whitespace-nowrap"
          >
            {item} — some longer content that overflows horizontally
          </div>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  ),
};
