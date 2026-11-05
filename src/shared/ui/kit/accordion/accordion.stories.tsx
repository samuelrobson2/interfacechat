import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from ".";

const meta: Meta<typeof Accordion> = {
  title: "UI/Kit/Accordion",
  component: Accordion,
  tags: ["autodocs"],
  argTypes: {
    // `type` drives the discriminated union — controlled per story, not globally
    disabled: {
      control: "boolean",
      description: "Disables all accordion items",
    },
    orientation: {
      control: "radio",
      options: ["vertical", "horizontal"],
      description: "Layout orientation of the accordion",
    },
    dir: {
      control: "radio",
      options: ["ltr", "rtl"],
      description: "Reading direction",
    },
  },
  args: {
    disabled: false,
    orientation: "vertical",
    dir: "ltr",
  },
};

export default meta;
type Story = StoryObj<typeof Accordion>;

// `type` and `collapsible` are set explicitly per story to avoid Radix
// discriminated union TypeScript errors. `disabled` / `orientation` / `dir`
// come from args so the Controls panel affects every story below.

export const Single: Story = {
  render: (args) => (
    <Accordion
      type="single"
      collapsible
      className="w-80"
      disabled={args.disabled}
      orientation={args.orientation}
      dir={args.dir}
    >
      <AccordionItem value="item-1">
        <AccordionTrigger>What is Pharos?</AccordionTrigger>
        <AccordionContent>
          Pharos is an AI-powered platform for building and managing datasets.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const Multiple: Story = {
  render: (args) => (
    <Accordion
      type="multiple"
      className="w-80"
      disabled={args.disabled}
      orientation={args.orientation}
      dir={args.dir}
    >
      <AccordionItem value="item-1">
        <AccordionTrigger>Getting started</AccordionTrigger>
        <AccordionContent>
          Create your first dataset and start training your AI model.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>How does billing work?</AccordionTrigger>
        <AccordionContent>
          We charge per dataset row processed. Check the pricing page for more
          details.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Can I export my data?</AccordionTrigger>
        <AccordionContent>
          Yes, you can export datasets in CSV, JSON and JSONL formats.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const DefaultOpen: Story = {
  render: (args) => (
    <Accordion
      type="single"
      defaultValue="item-1"
      collapsible
      className="w-80"
      disabled={args.disabled}
      orientation={args.orientation}
      dir={args.dir}
    >
      <AccordionItem value="item-1">
        <AccordionTrigger>Open by default</AccordionTrigger>
        <AccordionContent>
          This accordion item is expanded by default.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Closed by default</AccordionTrigger>
        <AccordionContent>Click the trigger above to expand.</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const Disabled: Story = {
  args: { disabled: true },
  render: (args) => (
    <Accordion
      type="single"
      collapsible
      className="w-80"
      disabled={args.disabled}
      orientation={args.orientation}
      dir={args.dir}
    >
      <AccordionItem value="item-1">
        <AccordionTrigger>Disabled item</AccordionTrigger>
        <AccordionContent>This content cannot be toggled.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Also disabled</AccordionTrigger>
        <AccordionContent>All items are disabled.</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const WithoutIcon: Story = {
  render: (args) => (
    <Accordion
      type="single"
      collapsible
      className="w-80"
      disabled={args.disabled}
      orientation={args.orientation}
      dir={args.dir}
    >
      <AccordionItem value="item-1">
        <AccordionTrigger showIcon={false}>No chevron icon</AccordionTrigger>
        <AccordionContent>
          This trigger has no expand/collapse icon.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};
