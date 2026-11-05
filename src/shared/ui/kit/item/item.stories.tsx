import { SettingsIcon } from "@/shared/assets/icons/general/Settings";
import { StarIcon } from "@/shared/assets/icons/general/Star";
import { TrashIcon } from "@/shared/assets/icons/general/Trash";
import linkedinImage from "@/shared/assets/images/linkedin.svg";
import { Button } from "@/shared/ui/kit/button";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from ".";

const meta: Meta<typeof Item> = {
  title: "UI/Kit/Item",
  component: Item,
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "select", options: ["default", "outline", "muted"] },
    size: { control: "select", options: ["default", "sm"] },
  },
  args: {
    variant: "default",
    size: "default",
  },
  render: (args) => (
    <Item {...args} className="w-96">
      <ItemContent>
        <ItemTitle>Item Title</ItemTitle>
        <ItemDescription>Item description goes here.</ItemDescription>
      </ItemContent>
    </Item>
  ),
};

export default meta;
type Story = StoryObj<typeof Item>;

export const Default: Story = {};

export const Outline: Story = {
  args: { variant: "outline" },
};

export const Muted: Story = {
  args: { variant: "muted" },
};

export const Small: Story = {
  args: { size: "sm" },
};

export const WithIconMedia: Story = {
  render: (args) => (
    <Item {...args} className="w-96">
      <ItemMedia variant="icon">
        <SettingsIcon className="size-4" />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>Settings</ItemTitle>
        <ItemDescription>Manage your account settings.</ItemDescription>
      </ItemContent>
    </Item>
  ),
};

export const WithImageMedia: Story = {
  render: (args) => (
    <Item {...args} className="w-96">
      <ItemMedia variant="image">
        <img src={linkedinImage} alt="thumbnail" />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>Image Item</ItemTitle>
        <ItemDescription>Item with an image thumbnail.</ItemDescription>
      </ItemContent>
    </Item>
  ),
};

export const WithActions: Story = {
  render: (args) => (
    <Item {...args} className="w-96">
      <ItemContent>
        <ItemTitle>Item with Actions</ItemTitle>
        <ItemDescription>This item has action buttons.</ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button variant="ghost" size="icon-md">
          <StarIcon className="size-4" pathClasses="stroke-current" />
        </Button>
        <Button variant="ghost" size="icon-md">
          <TrashIcon className="size-4" pathClasses="stroke-current" />
        </Button>
      </ItemActions>
    </Item>
  ),
};

export const WithIconAndActions: Story = {
  render: (args) => (
    <Item {...args} className="w-96">
      <ItemMedia variant="icon">
        <SettingsIcon className="size-4" />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>Settings</ItemTitle>
        <ItemDescription>
          Manage your account settings and preferences.
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button variant="ghost" size="icon-md">
          <TrashIcon className="size-4" pathClasses="stroke-current" />
        </Button>
      </ItemActions>
    </Item>
  ),
};

// Showcase: multiple instances — args not applicable
export const InGroup: Story = {
  render: () => (
    <ItemGroup className="w-96">
      <Item>
        <ItemMedia variant="icon">
          <SettingsIcon className="size-4" />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>First Item</ItemTitle>
          <ItemDescription>Description for the first item.</ItemDescription>
        </ItemContent>
      </Item>
      <ItemSeparator />
      <Item>
        <ItemMedia variant="icon">
          <StarIcon className="size-4" pathClasses="stroke-current" />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Second Item</ItemTitle>
          <ItemDescription>Description for the second item.</ItemDescription>
        </ItemContent>
      </Item>
      <ItemSeparator />
      <Item>
        <ItemMedia variant="icon">
          <TrashIcon className="size-4" pathClasses="stroke-current" />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Third Item</ItemTitle>
          <ItemDescription>Description for the third item.</ItemDescription>
        </ItemContent>
      </Item>
    </ItemGroup>
  ),
};
