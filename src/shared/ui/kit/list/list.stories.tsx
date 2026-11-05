import type { Meta, StoryObj } from "@storybook/react-vite";
import { List, ListItem } from ".";

const meta: Meta<typeof List> = {
  title: "UI/Kit/List",
  component: List,
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: "select",
      options: ["dot", "number", "line", "check"],
      description: "Marker type for list items",
    },
  },
  args: {
    type: "dot",
  },
  render: (args) => (
    <List {...args}>
      <ListItem>List item</ListItem>
      <ListItem>List item</ListItem>
      <ListItem>List item</ListItem>
      <ListItem>List item</ListItem>
      <ListItem>List item</ListItem>
    </List>
  ),
};

export default meta;
type Story = StoryObj<typeof List>;

export const Dot: Story = {
  args: { type: "dot" },
};

export const Number: Story = {
  args: { type: "number" },
};

export const Line: Story = {
  args: { type: "line" },
};

export const Check: Story = {
  args: { type: "check" },
};

// Showcase: all 4 types side-by-side
export const AllTypes: Story = {
  render: () => (
    <div className="flex gap-10">
      <List type="dot">
        <ListItem>List item</ListItem>
        <ListItem>List item</ListItem>
        <ListItem>List item</ListItem>
      </List>
      <List type="number">
        <ListItem>List item</ListItem>
        <ListItem>List item</ListItem>
        <ListItem>List item</ListItem>
      </List>
      <List type="line">
        <ListItem>List item</ListItem>
        <ListItem>List item</ListItem>
        <ListItem>List item</ListItem>
      </List>
      <List type="check">
        <ListItem>List item</ListItem>
        <ListItem>List item</ListItem>
        <ListItem>List item</ListItem>
      </List>
    </div>
  ),
};
