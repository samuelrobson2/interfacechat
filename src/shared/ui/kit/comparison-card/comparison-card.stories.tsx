import type { Meta, StoryObj } from "@storybook/react-vite";
import { ComparisonCard } from ".";

const meta: Meta<typeof ComparisonCard> = {
  title: "UI/Kit/ComparisonCard",
  component: ComparisonCard,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ComparisonCard>;

export const Default: Story = {
  args: {
    items: [
      {
        title: "Title 1",
        src: "https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=400&h=400&fit=crop",
        status: "accepted",
      },
      {
        title: "Title 2",
        src: "https://images.unsplash.com/photo-1682695797221-8164ff1fafc9?w=400&h=400&fit=crop",
        status: "rejected",
      },
    ],
  },
};

export const ThreeItems: Story = {
  args: {
    items: [
      {
        title: "Sample A",
        src: "https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=400&h=400&fit=crop",
        status: "accepted",
      },
      {
        title: "Sample B",
        src: "https://images.unsplash.com/photo-1682695797221-8164ff1fafc9?w=400&h=400&fit=crop",
        status: "rejected",
      },
      {
        title: "Sample C",
        src: "https://images.unsplash.com/photo-1682686581580-d99b0230064e?w=400&h=400&fit=crop",
        status: "accepted",
      },
    ],
  },
};

export const AllAccepted: Story = {
  args: {
    items: [
      {
        title: "Check 1",
        src: "https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=400&h=400&fit=crop",
        status: "accepted",
      },
      {
        title: "Check 2",
        src: "https://images.unsplash.com/photo-1682695797221-8164ff1fafc9?w=400&h=400&fit=crop",
        status: "accepted",
      },
    ],
  },
};

export const AllRejected: Story = {
  args: {
    items: [
      {
        title: "Attempt 1",
        src: "https://images.unsplash.com/photo-1682686581580-d99b0230064e?w=400&h=400&fit=crop",
        status: "rejected",
      },
      {
        title: "Attempt 2",
        src: "https://images.unsplash.com/photo-1694537745985-34eaf75e41e4?w=400&h=400&fit=crop",
        status: "rejected",
      },
    ],
  },
};

export const Loading: Story = {
  args: {
    items: [
      { title: "Loading A", status: "accepted", isLoading: true },
      { title: "Loading B", status: "accepted", isLoading: true },
      { title: "Loading C", status: "accepted", isLoading: true },
    ],
  },
};

export const MixedLoading: Story = {
  args: {
    items: [
      {
        title: "Ready",
        src: "https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=400&h=400&fit=crop",
        status: "accepted",
      },
      { title: "Loading…", status: "accepted", isLoading: true },
      { title: "Pending…", status: "accepted", isLoading: true },
    ],
  },
};
