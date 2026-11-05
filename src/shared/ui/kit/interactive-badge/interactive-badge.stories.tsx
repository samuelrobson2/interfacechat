import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { StarIcon } from "@/shared/assets/icons/general/Star";
import { InteractiveBadge } from ".";

const meta: Meta<typeof InteractiveBadge> = {
  title: "UI/Kit/InteractiveBadge",
  component: InteractiveBadge,
  tags: ["autodocs"],
  argTypes: {
    isSelected: {
      control: "boolean",
      description: "Highlights the badge as selected",
    },
    closable: {
      control: "boolean",
      description: "Shows close button",
    },
    disabled: {
      control: "boolean",
      description: "Disables the button",
    },
    size: {
      control: "select",
      options: ["default", "md", "sm", "icon"],
      description: "Badge size",
    },
    color: {
      control: "select",
      options: ["default", "ghost", "neutral", "accent"],
      description: "Color variant with different hover/selected styles",
    },
    radius: {
      control: "select",
      options: ["square"],
      description: "Border radius variant",
    },
  },
  args: {
    children: "Category",
    isSelected: false,
    closable: false,
    disabled: false,
    size: "default",
  },
};

export default meta;
type Story = StoryObj<typeof InteractiveBadge>;

const BADGE_LABELS = ["Category", "Design", "Engineering", "Marketing"];

export const Default: Story = {
  render: (args) => {
    const [selected, setSelected] = useState<string | null>(null);

    return (
      <div className="flex flex-wrap items-center gap-3">
        {BADGE_LABELS.map((label) => (
          <InteractiveBadge
            key={label}
            {...args}
            isSelected={selected === label}
            onClick={() => setSelected(selected === label ? null : label)}
          >
            {label}
          </InteractiveBadge>
        ))}
      </div>
    );
  },
};

export const Selected: Story = {
  args: { isSelected: true },
};

export const Closable: Story = {
  args: { closable: true },
};

export const SelectedClosable: Story = {
  args: { isSelected: true, closable: true },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const SmallSize: Story = {
  args: { size: "sm", children: "Tag" },
};

export const MediumSize: Story = {
  args: { size: "md" },
};

export const GhostColor: Story = {
  args: { color: "ghost" },
  render: (args) => {
    const [selected, setSelected] = useState<string | null>(null);

    return (
      <div className="flex flex-wrap items-center gap-3">
        {BADGE_LABELS.map((label) => (
          <InteractiveBadge
            key={label}
            {...args}
            isSelected={selected === label}
            onClick={() => setSelected(selected === label ? null : label)}
          >
            {label}
          </InteractiveBadge>
        ))}
      </div>
    );
  },
};

export const NeutralColor: Story = {
  args: { color: "neutral" },
  render: (args) => {
    const [selected, setSelected] = useState<string | null>(null);

    return (
      <div className="flex flex-wrap items-center gap-3">
        {BADGE_LABELS.map((label) => (
          <InteractiveBadge
            key={label}
            {...args}
            isSelected={selected === label}
            onClick={() => setSelected(selected === label ? null : label)}
          >
            {label}
          </InteractiveBadge>
        ))}
      </div>
    );
  },
};

export const AccentColor: Story = {
  args: { color: "accent" },
  render: (args) => {
    const [selected, setSelected] = useState<string | null>(null);

    return (
      <div className="flex flex-wrap items-center gap-3">
        {BADGE_LABELS.map((label) => (
          <InteractiveBadge
            key={label}
            {...args}
            isSelected={selected === label}
            onClick={() => setSelected(selected === label ? null : label)}
          >
            {label}
          </InteractiveBadge>
        ))}
      </div>
    );
  },
};

export const SquareRadius: Story = {
  args: { radius: "square" },
  render: (args) => {
    const [selected, setSelected] = useState<string | null>(null);

    return (
      <div className="flex flex-wrap items-center gap-3">
        {BADGE_LABELS.map((label) => (
          <InteractiveBadge
            key={label}
            {...args}
            isSelected={selected === label}
            onClick={() => setSelected(selected === label ? null : label)}
          >
            {label}
          </InteractiveBadge>
        ))}
      </div>
    );
  },
};

export const WithIcon: Story = {
  render: (args) => {
    const [selected, setSelected] = useState(false);

    return (
      <InteractiveBadge
        {...args}
        isSelected={selected}
        onClick={() => setSelected(!selected)}
      >
        <StarIcon className="size-4" pathClasses="stroke-current" />
        Featured
      </InteractiveBadge>
    );
  },
};

// Showcase: multiple instances — args not applicable
export const AllColorStatesWithIcon: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <div>
        <p className="mb-2 text-typography-secondary">Default color</p>
        <div className="flex flex-wrap items-center gap-3">
          <InteractiveBadge>
            <StarIcon className="size-4" pathClasses="stroke-current" />
            Default
          </InteractiveBadge>
          <InteractiveBadge isSelected>
            <StarIcon className="size-4" pathClasses="stroke-current" />
            Selected
          </InteractiveBadge>
        </div>
      </div>
      <div>
        <p className="mb-2 text-typography-secondary">
          Neutral color — icon turns white on selected
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <InteractiveBadge color="neutral">
            <StarIcon className="size-4" pathClasses="stroke-current" />
            Default
          </InteractiveBadge>
          <InteractiveBadge color="neutral" isSelected>
            <StarIcon className="size-4" pathClasses="stroke-current" />
            Selected
          </InteractiveBadge>
        </div>
      </div>
      <div>
        <p className="mb-2 text-typography-secondary">
          Accent color — icon turns white on selected
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <InteractiveBadge color="accent">
            <StarIcon className="size-4" pathClasses="stroke-current" />
            Default
          </InteractiveBadge>
          <InteractiveBadge color="accent" isSelected>
            <StarIcon className="size-4" pathClasses="stroke-current" />
            Selected
          </InteractiveBadge>
        </div>
      </div>
      <div>
        <p className="mb-2 text-typography-secondary">Ghost color</p>
        <div className="flex flex-wrap items-center gap-3">
          <InteractiveBadge color="ghost">
            <StarIcon className="size-4" pathClasses="stroke-current" />
            Default
          </InteractiveBadge>
          <InteractiveBadge color="ghost" isSelected>
            <StarIcon className="size-4" pathClasses="stroke-current" />
            Selected
          </InteractiveBadge>
        </div>
      </div>
    </div>
  ),
};

export const AllStates: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <InteractiveBadge>Default</InteractiveBadge>
      <InteractiveBadge isSelected>Selected</InteractiveBadge>
      <InteractiveBadge closable>Closable</InteractiveBadge>
      <InteractiveBadge isSelected closable>
        Selected + Closable
      </InteractiveBadge>
      <InteractiveBadge disabled>Disabled</InteractiveBadge>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <InteractiveBadge size="default">Default</InteractiveBadge>
      <InteractiveBadge size="md">Medium</InteractiveBadge>
      <InteractiveBadge size="sm">Small</InteractiveBadge>
    </div>
  ),
};

// Showcase: multiple instances — args not applicable
export const AllColorStates: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <div>
        <p className="mb-2 text-typography-secondary">Default color</p>
        <div className="flex flex-wrap items-center gap-3">
          <InteractiveBadge>Default</InteractiveBadge>
          <InteractiveBadge isSelected>Selected</InteractiveBadge>
        </div>
      </div>
      <div>
        <p className="mb-2 text-typography-secondary">Ghost color</p>
        <div className="flex flex-wrap items-center gap-3">
          <InteractiveBadge color="ghost">Default</InteractiveBadge>
          <InteractiveBadge color="ghost" isSelected>
            Selected
          </InteractiveBadge>
        </div>
      </div>
      <div>
        <p className="mb-2 text-typography-secondary">Neutral color</p>
        <div className="flex flex-wrap items-center gap-3">
          <InteractiveBadge color="neutral">Default</InteractiveBadge>
          <InteractiveBadge color="neutral" isSelected>
            Selected
          </InteractiveBadge>
        </div>
      </div>
      <div>
        <p className="mb-2 text-typography-secondary">Accent color</p>
        <div className="flex flex-wrap items-center gap-3">
          <InteractiveBadge color="accent">Default</InteractiveBadge>
          <InteractiveBadge color="accent" isSelected>
            Selected
          </InteractiveBadge>
        </div>
      </div>
    </div>
  ),
};

// Showcase: multiple instances — args not applicable
export const AllColorStatesSquare: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <div>
        <p className="mb-2 text-typography-secondary">
          Default color (square)
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <InteractiveBadge radius="square">Default</InteractiveBadge>
          <InteractiveBadge radius="square" isSelected>
            Selected
          </InteractiveBadge>
        </div>
      </div>
      <div>
        <p className="mb-2 text-typography-secondary">Ghost color (square)</p>
        <div className="flex flex-wrap items-center gap-3">
          <InteractiveBadge color="ghost" radius="square">
            Default
          </InteractiveBadge>
          <InteractiveBadge color="ghost" radius="square" isSelected>
            Selected
          </InteractiveBadge>
        </div>
      </div>
      <div>
        <p className="mb-2 text-typography-secondary">
          Neutral color (square)
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <InteractiveBadge color="neutral" radius="square">
            Default
          </InteractiveBadge>
          <InteractiveBadge color="neutral" radius="square" isSelected>
            Selected
          </InteractiveBadge>
        </div>
      </div>
      <div>
        <p className="mb-2 text-typography-secondary">Accent color (square)</p>
        <div className="flex flex-wrap items-center gap-3">
          <InteractiveBadge color="accent" radius="square">
            Default
          </InteractiveBadge>
          <InteractiveBadge color="accent" radius="square" isSelected>
            Selected
          </InteractiveBadge>
        </div>
      </div>
    </div>
  ),
};
