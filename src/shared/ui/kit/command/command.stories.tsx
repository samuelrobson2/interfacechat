import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { Button } from "@/shared/ui/kit/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from ".";

const meta: Meta<typeof Command> = {
  title: "UI/Kit/Command",
  component: Command,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof Command>;

const CommandRoot = ({
  ...props
}: React.ComponentProps<typeof Command>) => (
  <Command
    className="w-80 p-4 rounded-[8px] border border-stroke-secondary shadow-sm"
    {...props}
  />
);

export const Default: Story = {
  render: () => (
    <CommandRoot>
      <CommandInput placeholder="Search…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem>Calendar</CommandItem>
          <CommandItem>Search Emoji</CommandItem>
          <CommandItem>Calculator</CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandRoot>
  ),
};

export const WithGroups: Story = {
  render: () => (
    <CommandRoot>
      <CommandInput placeholder="Search commands…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="General">
          <CommandItem>Profile</CommandItem>
          <CommandItem>Settings</CommandItem>
          <CommandItem>Notifications</CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Workspace">
          <CommandItem>New Project</CommandItem>
          <CommandItem>New Dataset</CommandItem>
          <CommandItem>Invite Team Member</CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandRoot>
  ),
};

export const WithShortcuts: Story = {
  render: () => (
    <CommandRoot>
      <CommandInput placeholder="Search…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Actions">
          <CommandItem>
            New File
            <CommandShortcut>⌘N</CommandShortcut>
          </CommandItem>
          <CommandItem>
            Open File
            <CommandShortcut>⌘O</CommandShortcut>
          </CommandItem>
          <CommandItem>
            Save
            <CommandShortcut>⌘S</CommandShortcut>
          </CommandItem>
          <CommandItem>
            Find in Project
            <CommandShortcut>⌘⇧F</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandRoot>
  ),
};

export const Loading: Story = {
  render: () => (
    <CommandRoot>
      <CommandInput placeholder="Search…" />
      <CommandList>
        <CommandGroup isLoading heading="Results" />
      </CommandList>
    </CommandRoot>
  ),
};

export const EmptyState: Story = {
  render: () => (
    <CommandRoot className="w-80 rounded-[8px] border border-stroke-primary shadow-sm">
      <CommandInput placeholder="Type something unusual…" />
      <CommandList>
        <CommandEmpty>No commands match your search.</CommandEmpty>
        <CommandGroup heading="Results">
          {/* intentionally empty to trigger empty state */}
        </CommandGroup>
      </CommandList>
    </CommandRoot>
  ),
};

export const WithSelectedItem: Story = {
  render: () => (
    <CommandRoot>
      <CommandInput placeholder="Search…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Team Members">
          <CommandItem isSelected>Alice Johnson</CommandItem>
          <CommandItem>Bob Smith</CommandItem>
          <CommandItem>Carol White</CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandRoot>
  ),
};

const DialogStory = () => {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Open Command Palette
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search…" />
        <CommandList className="p-2">
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Navigation">
            <CommandItem>Dashboard</CommandItem>
            <CommandItem>Projects</CommandItem>
            <CommandItem>Datasets</CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Actions">
            <CommandItem>
              New Project
              <CommandShortcut>⌘N</CommandShortcut>
            </CommandItem>
            <CommandItem>
              Settings
              <CommandShortcut>⌘,</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
};

// Showcase: dialog requires local state — args not applicable
export const Dialog: Story = {
  render: () => <DialogStory />,
};
