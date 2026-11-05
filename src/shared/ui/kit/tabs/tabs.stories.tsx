import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Tabs,
  TabsContent,
  TabsList,
  tabsListVariants,
  TabsTrigger,
  tabsTriggerVariants,
} from ".";
import type { VariantProps } from "class-variance-authority";

type TabsStoryArgs = React.ComponentProps<typeof Tabs> & {
  variant?: VariantProps<typeof tabsListVariants>["variant"];
  color?: VariantProps<typeof tabsTriggerVariants>["color"];
  size?: VariantProps<typeof tabsTriggerVariants>["size"];
};

const meta: Meta<TabsStoryArgs> = {
  title: "UI/Kit/Tabs",
  component: Tabs,
  tags: ["autodocs"],
  argTypes: {
    defaultValue: {
      control: "text",
      description: "Initially active tab value",
    },
    variant: {
      control: "select",
      options: ["underline", "solid", "pill"],
      description: "Variant of the Tabs",
    },
    color: {
      control: "select",
      options: ["default", "blue"],
      description: "Color of the Tabs",
    },
    size: {
      control: "select",
      options: ["lg", "md"],
      description: "Size of the Tabs",
    },
  },
  args: {
    defaultValue: "tab1",
    variant: "underline",
    color: "default",
    size: "lg",
  },
  render: (args) => (
    <Tabs {...args} className="w-100 max-w-md">
      <TabsList variant={args.variant} color={args.color} size={args.size ?? "lg"}>
        <TabsTrigger value="tab1">Overview</TabsTrigger>
        <TabsTrigger value="tab2">Analytics</TabsTrigger>
        <TabsTrigger value="tab3">Reports</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">Overview content goes here.</TabsContent>
      <TabsContent value="tab2">Analytics content goes here.</TabsContent>
      <TabsContent value="tab3">Reports content goes here.</TabsContent>
    </Tabs>
  ),
};

export default meta;
type Story = StoryObj<typeof Tabs>;

export const Default: Story = {};

export const SecondTabActive: Story = {
  args: { defaultValue: "tab2" },
};

export const WithDisabledTab: Story = {
  render: (args) => (
    <Tabs {...args} className="w-100 max-w-md">
      <TabsList>
        <TabsTrigger value="tab1">Overview</TabsTrigger>
        <TabsTrigger value="tab2" disabled>
          Analytics
        </TabsTrigger>
        <TabsTrigger value="tab3">Reports</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">Overview content goes here.</TabsContent>
      <TabsContent value="tab3">Reports content goes here.</TabsContent>
    </Tabs>
  ),
};

export const UnderlineBlue: Story = {
  render: (args) => (
    <Tabs {...args} className="w-100 max-w-md">
      <TabsList variant="underline" color="blue">
        <TabsTrigger value="tab1">Overview</TabsTrigger>
        <TabsTrigger value="tab2">Analytics</TabsTrigger>
        <TabsTrigger value="tab3">Reports</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">Overview content goes here.</TabsContent>
      <TabsContent value="tab2">Analytics content goes here.</TabsContent>
      <TabsContent value="tab3">Reports content goes here.</TabsContent>
    </Tabs>
  ),
};

export const UnderlineMedium: Story = {
  render: (args) => (
    <Tabs {...args} className="w-100 max-w-md">
      <TabsList variant="underline" size="md">
        <TabsTrigger value="tab1">Overview</TabsTrigger>
        <TabsTrigger value="tab2">Analytics</TabsTrigger>
        <TabsTrigger value="tab3">Reports</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">Overview content goes here.</TabsContent>
      <TabsContent value="tab2">Analytics content goes here.</TabsContent>
      <TabsContent value="tab3">Reports content goes here.</TabsContent>
    </Tabs>
  ),
};

export const Solid: Story = {
  render: (args) => (
    <Tabs {...args}>
      <TabsList variant="solid">
        <TabsTrigger value="tab1">Overview</TabsTrigger>
        <TabsTrigger value="tab2">Analytics</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">Overview content goes here.</TabsContent>
      <TabsContent value="tab2">Analytics content goes here.</TabsContent>
    </Tabs>
  ),
};

export const SolidBlue: Story = {
  render: (args) => (
    <Tabs {...args}>
      <TabsList variant="solid" color="blue">
        <TabsTrigger value="tab1">Overview</TabsTrigger>
        <TabsTrigger value="tab2">Analytics</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">Overview content goes here.</TabsContent>
      <TabsContent value="tab2">Analytics content goes here.</TabsContent>
    </Tabs>
  ),
};

export const SolidMedium: Story = {
  render: (args) => (
    <Tabs {...args}>
      <TabsList variant="solid" size="md">
        <TabsTrigger value="tab1">Overview</TabsTrigger>
        <TabsTrigger value="tab2">Analytics</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">Overview content goes here.</TabsContent>
      <TabsContent value="tab2">Analytics content goes here.</TabsContent>
    </Tabs>
  ),
};

export const Pill: Story = {
  render: (args) => (
    <Tabs {...args}>
      <TabsList variant="pill">
        <TabsTrigger value="tab1">Overview</TabsTrigger>
        <TabsTrigger value="tab2">Analytics</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">Overview content goes here.</TabsContent>
      <TabsContent value="tab2">Analytics content goes here.</TabsContent>
    </Tabs>
  ),
};

export const PillBlue: Story = {
  render: (args) => (
    <Tabs {...args}>
      <TabsList variant="pill" color="blue">
        <TabsTrigger value="tab1">Overview</TabsTrigger>
        <TabsTrigger value="tab2">Analytics</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">Overview content goes here.</TabsContent>
      <TabsContent value="tab2">Analytics content goes here.</TabsContent>
    </Tabs>
  ),
};

export const PillMedium: Story = {
  render: (args) => (
    <Tabs {...args}>
      <TabsList variant="pill" size="md">
        <TabsTrigger value="tab1">Overview</TabsTrigger>
        <TabsTrigger value="tab2">Analytics</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">Overview content goes here.</TabsContent>
      <TabsContent value="tab2">Analytics content goes here.</TabsContent>
    </Tabs>
  ),
};

// Showcase: multiple instances — args not applicable
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <p className="text-typography-secondary text-[14px]">
          Underline Default (lg)
        </p>
        <Tabs defaultValue="tab1" className="w-80">
          <TabsList variant="underline" color="default" size="lg">
            <TabsTrigger value="tab1">Label</TabsTrigger>
            <TabsTrigger value="tab2">Label</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-typography-secondary text-[14px]">
          Underline Blue (lg)
        </p>
        <Tabs defaultValue="tab1" className="w-80">
          <TabsList variant="underline" color="blue" size="lg">
            <TabsTrigger value="tab1">Label</TabsTrigger>
            <TabsTrigger value="tab2">Label</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-typography-secondary text-[14px]">
          Solid Default (lg)
        </p>
        <Tabs defaultValue="tab1">
          <TabsList variant="solid" color="default" size="lg">
            <TabsTrigger value="tab1">Label</TabsTrigger>
            <TabsTrigger value="tab2">Label</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-typography-secondary text-[14px]">Solid Blue (lg)</p>
        <Tabs defaultValue="tab1">
          <TabsList variant="solid" color="blue" size="lg">
            <TabsTrigger value="tab1">Label</TabsTrigger>
            <TabsTrigger value="tab2">Label</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-typography-secondary text-[14px]">
          Pill Default (lg)
        </p>
        <Tabs defaultValue="tab1">
          <TabsList variant="pill" color="default" size="lg">
            <TabsTrigger value="tab1">Label</TabsTrigger>
            <TabsTrigger value="tab2">Label</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-typography-secondary text-[14px]">Pill Blue (lg)</p>
        <Tabs defaultValue="tab1">
          <TabsList variant="pill" color="blue" size="lg">
            <TabsTrigger value="tab1">Label</TabsTrigger>
            <TabsTrigger value="tab2">Label</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-typography-secondary text-[14px]">
          Underline Default (md)
        </p>
        <Tabs defaultValue="tab1" className="w-80">
          <TabsList variant="underline" color="default" size="md">
            <TabsTrigger value="tab1">Label</TabsTrigger>
            <TabsTrigger value="tab2">Label</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-typography-secondary text-[14px]">
          Solid Default (md)
        </p>
        <Tabs defaultValue="tab1">
          <TabsList variant="solid" color="default" size="md">
            <TabsTrigger value="tab1">Label</TabsTrigger>
            <TabsTrigger value="tab2">Label</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-typography-secondary text-[14px]">
          Pill Default (md)
        </p>
        <Tabs defaultValue="tab1">
          <TabsList variant="pill" color="default" size="md">
            <TabsTrigger value="tab1">Label</TabsTrigger>
            <TabsTrigger value="tab2">Label</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  ),
};
