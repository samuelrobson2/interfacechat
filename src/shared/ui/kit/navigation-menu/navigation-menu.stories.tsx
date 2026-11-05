import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from ".";
import { Text } from "../text";
import { Separator } from "../separator";

// Reusable dropdown content block — 3 links with title + description
const MenuContentItems = () => (
  <>
    <NavigationMenuLink href="#">
      <Text variant="body" color="primary">Title</Text>
      <Text variant="body" color="secondary">Description</Text>
    </NavigationMenuLink>
    <Separator color="secondary" />
    <NavigationMenuLink href="#">
      <Text variant="body" color="primary">Title</Text>
      <Text variant="body" color="secondary">Description</Text>
    </NavigationMenuLink>
    <Separator color="secondary" />
    <NavigationMenuLink href="#">
      <Text variant="body" color="primary">Title</Text>
      <Text variant="body" color="secondary">Description</Text>
    </NavigationMenuLink>
  </>
);

const meta: Meta<typeof NavigationMenu> = {
  title: "UI/Kit/NavigationMenu",
  component: NavigationMenu,
  decorators: [
    (Story) => (
      <div className="h-[300px]">
        <Story />
      </div>
    ),
  ],
  tags: ["autodocs"],
  argTypes: {
    viewport: {
      control: "boolean",
      description: "Whether to render the viewport container",
    },
  },
  args: {
    viewport: true,
  },
  // Default render: dropdown triggers + inline links mixed
  render: (args) => (
    <NavigationMenu {...args}>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Menu item</NavigationMenuTrigger>
          <NavigationMenuContent>
            <MenuContentItems />
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Menu item</NavigationMenuTrigger>
          <NavigationMenuContent>
            <MenuContentItems />
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Menu item</NavigationMenuTrigger>
          <NavigationMenuContent>
            <MenuContentItems />
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink variant="inline" href="https://example.com/pricing">
            Pricing
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink variant="inline" href="https://example.com/blog">
            Blog
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  ),
};

export default meta;
type Story = StoryObj<typeof NavigationMenu>;

export const Default: Story = {};

export const WithoutViewport: Story = {
  args: { viewport: false },
};

export const SingleItem: Story = {
  render: (args) => (
    <NavigationMenu {...args}>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Menu item</NavigationMenuTrigger>
          <NavigationMenuContent>
            <MenuContentItems />
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  ),
};

// Showcase: inline links directly in NavigationMenuItem without dropdown
export const WithDirectLinks: Story = {
  render: (args) => (
    <NavigationMenu {...args}>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Dropdown</NavigationMenuTrigger>
          <NavigationMenuContent>
            <MenuContentItems />
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink variant="inline" href="#">About</NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink variant="inline" href="#">Pricing</NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink variant="inline" href="#">Blog</NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  ),
};

// Showcase: NavigationMenuIndicator — arrow points to currently open item
export const WithIndicator: Story = {
  render: (args) => (
    <NavigationMenu {...args}>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Menu item</NavigationMenuTrigger>
          <NavigationMenuContent>
            <MenuContentItems />
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Menu item</NavigationMenuTrigger>
          <NavigationMenuContent>
            <MenuContentItems />
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Menu item</NavigationMenuTrigger>
          <NavigationMenuContent>
            <MenuContentItems />
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuIndicator />
      </NavigationMenuList>
    </NavigationMenu>
  ),
};

// Showcase: real-world example with labelled content links
export const WithLinks: Story = {
  render: (args) => (
    <NavigationMenu {...args}>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Products</NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavigationMenuLink href="#">
              <Text variant="body" color="primary">Analytics</Text>
              <Text variant="body" color="secondary">Track your metrics</Text>
            </NavigationMenuLink>
            <NavigationMenuLink href="#">
              <Text variant="body" color="primary">Automation</Text>
              <Text variant="body" color="secondary">Streamline workflows</Text>
            </NavigationMenuLink>
            <NavigationMenuLink href="#">
              <Text variant="body" color="primary">Integrations</Text>
              <Text variant="body" color="secondary">Connect your tools</Text>
            </NavigationMenuLink>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavigationMenuLink href="#">
              <Text variant="body" color="primary">Documentation</Text>
              <Text variant="body" color="secondary">Get started quickly</Text>
            </NavigationMenuLink>
            <NavigationMenuLink href="#">
              <Text variant="body" color="primary">API Reference</Text>
              <Text variant="body" color="secondary">Detailed endpoints guide</Text>
            </NavigationMenuLink>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink variant="inline" href="#">Pricing</NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  ),
};
