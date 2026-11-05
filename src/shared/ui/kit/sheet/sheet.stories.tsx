import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from ".";

const meta: Meta<typeof Sheet> = {
  title: "UI/Kit/Sheet",
  component: Sheet,
  tags: ["autodocs"],
  argTypes: {
    modal: {
      control: "boolean",
      description: "Prevents interaction with elements outside the sheet",
    },
  },
  args: {
    modal: true,
  },
};

export default meta;
type Story = StoryObj<typeof Sheet>;

export const Right: Story = {
  render: (args) => (
    <Sheet {...args}>
      <SheetTrigger asChild>
        <Button variant="secondary">Open Right Sheet</Button>
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Sheet Title</SheetTitle>
          <SheetDescription>
            This sheet slides in from the right side.
          </SheetDescription>
        </SheetHeader>
        <SheetFooter>
          <Button className="flex-1">Save</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
};

export const Left: Story = {
  render: (args) => (
    <Sheet {...args}>
      <SheetTrigger asChild>
        <Button variant="secondary">Open Left Sheet</Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Navigation</SheetTitle>
          <SheetDescription>
            This sheet slides in from the left side.
          </SheetDescription>
        </SheetHeader>
        <SheetFooter>
          <Button className="flex-1">Close</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
};

export const Top: Story = {
  render: (args) => (
    <Sheet {...args}>
      <SheetTrigger asChild>
        <Button variant="secondary">Open Top Sheet</Button>
      </SheetTrigger>
      <SheetContent side="top">
        <SheetHeader>
          <SheetTitle>Notification</SheetTitle>
          <SheetDescription>
            This sheet slides in from the top.
          </SheetDescription>
        </SheetHeader>
        <SheetFooter>
          <Button className="flex-1">Dismiss</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
};

export const Bottom: Story = {
  render: (args) => (
    <Sheet {...args}>
      <SheetTrigger asChild>
        <Button variant="secondary">Open Bottom Sheet</Button>
      </SheetTrigger>
      <SheetContent side="bottom">
        <SheetHeader>
          <SheetTitle>Quick Actions</SheetTitle>
          <SheetDescription>
            This sheet slides in from the bottom.
          </SheetDescription>
        </SheetHeader>
        <SheetFooter>
          <Button className="flex-1">Confirm</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
};
