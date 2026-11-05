import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectGroup,
  MultiSelectItem,
  MultiSelectSeparator,
  MultiSelectTrigger,
  MultiSelectValue,
} from ".";

const FRAMEWORKS = ["React", "Vue", "Angular", "Svelte"] as const;
const LANGUAGES = ["TypeScript", "JavaScript"] as const;

const meta: Meta<typeof MultiSelect> = {
  title: "UI/Kit/MultiSelect",
  component: MultiSelect,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-72 h-screen">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    defaultValues: {
      control: false,
      description: "Initially selected values (uncontrolled)",
    },
    values: {
      control: false,
      description: "Controlled selected values",
    },
    onValuesChange: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof MultiSelect>;

export const Default: Story = {
  render: (args) => (
    <MultiSelect {...args}>
      <MultiSelectTrigger>
        <MultiSelectValue placeholder="Select frameworks…" />
      </MultiSelectTrigger>
      <MultiSelectContent>
        {FRAMEWORKS.map((f) => (
          <MultiSelectItem key={f} value={f}>
            {f}
          </MultiSelectItem>
        ))}
      </MultiSelectContent>
    </MultiSelect>
  ),
};

export const WithPreselected: Story = {
  render: (args) => (
    <MultiSelect {...args} defaultValues={["React", "Vue"]}>
      <MultiSelectTrigger>
        <MultiSelectValue placeholder="Select frameworks…" />
      </MultiSelectTrigger>
      <MultiSelectContent>
        {FRAMEWORKS.map((f) => (
          <MultiSelectItem key={f} value={f}>
            {f}
          </MultiSelectItem>
        ))}
      </MultiSelectContent>
    </MultiSelect>
  ),
};

export const WithGroups: Story = {
  render: (args) => (
    <MultiSelect {...args}>
      <MultiSelectTrigger>
        <MultiSelectValue placeholder="Select…" />
      </MultiSelectTrigger>
      <MultiSelectContent>
        <MultiSelectGroup heading="Frontend">
          {FRAMEWORKS.map((f) => (
            <MultiSelectItem key={f} value={f}>
              {f}
            </MultiSelectItem>
          ))}
        </MultiSelectGroup>
        <MultiSelectSeparator />
        <MultiSelectGroup heading="Languages">
          {LANGUAGES.map((l) => (
            <MultiSelectItem key={l} value={l}>
              {l}
            </MultiSelectItem>
          ))}
        </MultiSelectGroup>
      </MultiSelectContent>
    </MultiSelect>
  ),
};

export const WithError: Story = {
  render: (args) => (
    <MultiSelect {...args}>
      <MultiSelectTrigger error="Please select at least one option">
        <MultiSelectValue placeholder="Select frameworks…" />
      </MultiSelectTrigger>
      <MultiSelectContent>
        {FRAMEWORKS.map((f) => (
          <MultiSelectItem key={f} value={f}>
            {f}
          </MultiSelectItem>
        ))}
      </MultiSelectContent>
    </MultiSelect>
  ),
};

export const NoSearch: Story = {
  render: (args) => (
    <MultiSelect {...args}>
      <MultiSelectTrigger>
        <MultiSelectValue placeholder="Select frameworks…" />
      </MultiSelectTrigger>
      <MultiSelectContent search={false}>
        {FRAMEWORKS.map((f) => (
          <MultiSelectItem key={f} value={f}>
            {f}
          </MultiSelectItem>
        ))}
      </MultiSelectContent>
    </MultiSelect>
  ),
};

export const PrimaryBadges: Story = {
  render: (args) => (
    <MultiSelect {...args} defaultValues={["React", "Vue", "Angular"]}>
      <MultiSelectTrigger>
        <MultiSelectValue placeholder="Select…" badgeColor="default" />
      </MultiSelectTrigger>
      <MultiSelectContent>
        {FRAMEWORKS.map((f) => (
          <MultiSelectItem key={f} value={f}>
            {f}
          </MultiSelectItem>
        ))}
      </MultiSelectContent>
    </MultiSelect>
  ),
};
