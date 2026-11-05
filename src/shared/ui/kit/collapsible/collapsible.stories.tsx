import { Button } from "@/shared/ui/kit/button";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from ".";

const meta: Meta<typeof Collapsible> = {
  title: "UI/Kit/Collapsible",
  component: Collapsible,
  tags: ["autodocs"],
  argTypes: {
    disabled: { control: "boolean" },
    defaultOpen: { control: "boolean" },
  },
  args: {
    disabled: false,
    defaultOpen: false,
  },
  render: (args) => (
    <Collapsible {...args} className="w-80">
      <CollapsibleTrigger asChild>
        <Button variant="secondary" size="48">
          Toggle content
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="p-4 border border-stroke-secondary rounded-[4px]">
        Hidden content that can be revealed or collapsed.
      </CollapsibleContent>
    </Collapsible>
  ),
};

export default meta;
type Story = StoryObj<typeof Collapsible>;

export const Default: Story = {};

export const DefaultOpen: Story = {
  args: { defaultOpen: true },
};

export const Disabled: Story = {
  args: { disabled: true },
};

