import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { DateRange } from "react-day-picker";
import { Calendar } from ".";

const meta: Meta<typeof Calendar> = {
  title: "UI/Kit/Calendar",
  component: Calendar,
  tags: ["autodocs"],
  argTypes: {
    captionLayout: {
      control: "select",
      options: ["label", "dropdown", "dropdown-years", "dropdown-months"],
    },
    showOutsideDays: { control: "boolean" },
    showWeekNumber: { control: "boolean" },
    buttonVariant: {
      control: "select",
      options: ["ghost", "secondary", "tertiary"],
    },
  },
  args: {
    captionLayout: "label",
    showOutsideDays: true,
    showWeekNumber: false,
    buttonVariant: "ghost",
  },
  render: (args) => {
    const [selected, setSelected] = React.useState<Date | undefined>(
      new Date(),
    );
    return (
      <Calendar
        mode="single"
        selected={selected}
        onSelect={setSelected}
        captionLayout={args.captionLayout}
        showOutsideDays={args.showOutsideDays}
        showWeekNumber={args.showWeekNumber}
        buttonVariant={args.buttonVariant}
      />
    );
  },
};

export default meta;
type Story = StoryObj<typeof Calendar>;

export const Single: Story = {
};

export const Range: Story = {
  render: (args) => {
    const [range, setRange] = React.useState<DateRange | undefined>({
      from: new Date(),
      to: undefined,
    });
    return (
      <Calendar
        mode="range"
        selected={range}
        onSelect={setRange}
        captionLayout={args.captionLayout}
        showOutsideDays={args.showOutsideDays}
        showWeekNumber={args.showWeekNumber}
        buttonVariant={args.buttonVariant}
      />
    );
  },
};

export const Multiple: Story = {
  render: (args) => {
    const [selected, setSelected] = React.useState<Date[] | undefined>([
      new Date(),
    ]);
    return (
      <Calendar
        mode="multiple"
        selected={selected}
        onSelect={setSelected}
        captionLayout={args.captionLayout}
        showOutsideDays={args.showOutsideDays}
        showWeekNumber={args.showWeekNumber}
        buttonVariant={args.buttonVariant}
      />
    );
  },
};

export const DropdownNavigation: Story = {
  args: { captionLayout: "dropdown" },
};

export const WithWeekNumbers: Story = {
  args: { showWeekNumber: true },
};
