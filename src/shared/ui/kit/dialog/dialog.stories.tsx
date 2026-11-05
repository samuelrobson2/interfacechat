import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from ".";

const meta: Meta<typeof Dialog> = {
  title: "UI/Kit/Dialog",
  component: Dialog,
  tags: ["autodocs"],
  argTypes: {
    modal: {
      control: "boolean",
      description: "Prevents interaction with elements outside the dialog",
    },
  },
  args: {
    modal: true,
  },
};

export default meta;
type Story = StoryObj<typeof Dialog>;

export const Default: Story = {
  render: (args) => (
    <Dialog {...args}>
      <DialogTrigger asChild>
        <Button >Open Dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dialog Title</DialogTitle>
        </DialogHeader>
        <DialogFooter showCancelButton={false}>
          <Button className="flex-1">
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const WithDescription: Story = {
  render: (args) => (
    <Dialog {...args}>
      <DialogTrigger asChild>
        <Button >Open Dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Action</DialogTitle>
          <DialogDescription>
            Are you sure you want to perform this action? This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button className="flex-1">
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const WithCloseButton: Story = {
  render: (args) => (
    <Dialog {...args}>
      <DialogTrigger asChild>
        <Button >Open Dialog</Button>
      </DialogTrigger>
      <DialogContent showCloseButton>
        <DialogHeader>
          <DialogTitle>Dialog with Close Button</DialogTitle>
          <DialogDescription>
            This dialog has a close button in the top-right corner.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button className="flex-1">
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const WithoutCancelButton: Story = {
  render: (args) => (
    <Dialog {...args}>
      <DialogTrigger asChild>
        <Button >Open Dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Information</DialogTitle>
          <DialogDescription>
            This dialog only has a confirmation button, no cancel option.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter showCancelButton={false}>
          <Button className="flex-1">
            Got it
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};
