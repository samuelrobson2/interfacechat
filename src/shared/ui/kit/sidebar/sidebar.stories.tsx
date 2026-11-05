import { BuildIcon } from "@/shared/assets/icons/general/Build";
import { ChatIcon } from "@/shared/assets/icons/general/Chat";
import { ChatHistoryIcon } from "@/shared/assets/icons/general/ChatHistory";
import { DashboardIcon } from "@/shared/assets/icons/general/Dashboard";
import { LogoIcon } from "@/shared/assets/icons/Logo";
import { Avatar, AvatarFallback } from "@/shared/ui/kit/avatar";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  SidebarCard,
  SidebarItem,
  SidebarItemLabel,
  SidebarLayout,
} from ".";

const meta: Meta<typeof SidebarItem> = {
  title: "UI/Kit/Sidebar",
  component: SidebarItem,
  tags: ["autodocs"],
  argTypes: {
    isActive: {
      control: "boolean",
      description: "Highlights the item as currently active",
    },
  },
  args: {
    isActive: false,
  },
  render: (args) => (
    <SidebarLayout expanded className="static">
      <SidebarCard>
        <SidebarItem {...args}>
          <DashboardIcon />
          <SidebarItemLabel>Dashboard</SidebarItemLabel>
        </SidebarItem>
      </SidebarCard>
    </SidebarLayout>
  ),
};

export default meta;
type Story = StoryObj<typeof SidebarItem>;

export const Item: Story = {};

export const ItemActive: Story = {
  args: { isActive: true },
};

// Showcase: full sidebar in the expanded state — args not applicable
export const FullSidebar: Story = {
  parameters: { layout: "fullscreen" },
  render: () => (
    <div className="p-8">
      <SidebarLayout expanded className="static">
        <SidebarCard>
          <div className="flex w-full items-center gap-2 p-2">
            <LogoIcon svgClasses="size-[18px] shrink-0" />
            <span className="text-[18px] font-medium leading-none text-typography-primary">
              adaption
            </span>
          </div>
          <SidebarItem>
            <BuildIcon />
            <SidebarItemLabel>Build</SidebarItemLabel>
          </SidebarItem>
          <SidebarItem>
            <DashboardIcon />
            <SidebarItemLabel>Dashboard</SidebarItemLabel>
          </SidebarItem>
          <SidebarItem isActive>
            <ChatIcon />
            <SidebarItemLabel>New Chat</SidebarItemLabel>
          </SidebarItem>
          <SidebarItem>
            <ChatHistoryIcon />
            <SidebarItemLabel>Chat History</SidebarItemLabel>
          </SidebarItem>
        </SidebarCard>

        <SidebarCard>
          <SidebarItem>
            <Avatar className="size-6">
              <AvatarFallback userName="Jack" />
            </Avatar>
            <SidebarItemLabel>Jack Roizental</SidebarItemLabel>
          </SidebarItem>
        </SidebarCard>
      </SidebarLayout>
    </div>
  ),
};

// Showcase: collapsed icon rail (expands on hover) — args not applicable
export const Collapsed: Story = {
  parameters: { layout: "fullscreen" },
  render: () => (
    <div className="p-8">
      <SidebarLayout className="static">
        <SidebarCard>
          <SidebarItem>
            <BuildIcon />
            <SidebarItemLabel>Build</SidebarItemLabel>
          </SidebarItem>
          <SidebarItem isActive>
            <ChatIcon />
            <SidebarItemLabel>New Chat</SidebarItemLabel>
          </SidebarItem>
        </SidebarCard>
      </SidebarLayout>
    </div>
  ),
};
