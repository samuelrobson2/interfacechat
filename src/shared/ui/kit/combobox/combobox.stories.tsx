import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
} from ".";

const meta: Meta<typeof Combobox> = {
  title: "UI/Kit/Combobox",
  component: Combobox,
  tags: ["autodocs"],
  argTypes: {
    disabled: {
      control: "boolean",
      description: "Disables the entire combobox",
    },
    modal: {
      control: "boolean",
      description: "Whether the popup renders in a modal",
    },
  },
  args: {
    disabled: false,
    modal: false,
  },
};

export default meta;
type Story = StoryObj<typeof Combobox>;

const frameworks1 = ["React", "Vue", "Angular", "Svelte", "SolidJS"] as const;
const frameworks2 = [
  "JavaScript",
  "TypeScript",
  "Python",
  "Java",
  "C#",
] as const;

export const Default: Story = {
  render: (args) => (
    <Combobox {...args} items={frameworks1}>
      <ComboboxInput label="Select framework…" />
      <ComboboxContent>
        <ComboboxList>
          {(f) => (
            <ComboboxItem key={f} value={f}>
              {f}
            </ComboboxItem>
          )}
        </ComboboxList>
        <ComboboxEmpty>No results found.</ComboboxEmpty>
      </ComboboxContent>
    </Combobox>
  ),
};

export const WithGroups: Story = {
  render: (args) => (
    <Combobox {...args} items={[...frameworks1, ...frameworks2]}>
      <ComboboxInput label="Select framework…" />
      <ComboboxContent>
        <ComboboxList>
          <ComboboxGroup>
            <ComboboxLabel>Frontend</ComboboxLabel>
            {frameworks1.map((f) => (
              <ComboboxItem key={f} value={f}>
                {f}
              </ComboboxItem>
            ))}
          </ComboboxGroup>
          <ComboboxGroup>
            <ComboboxLabel>Backend</ComboboxLabel>
            {frameworks2.map((f) => (
              <ComboboxItem key={f} value={f}>
                {f}
              </ComboboxItem>
            ))}
          </ComboboxGroup>
        </ComboboxList>
        <ComboboxEmpty>No results found.</ComboboxEmpty>
      </ComboboxContent>
    </Combobox>
  ),
};

export const EmptyState: Story = {
  render: (args) => (
    <Combobox defaultOpen {...args} items={frameworks1}>
      <ComboboxInput label="Type something unusual…" defaultValue="zzz" />
      <ComboboxContent>
        <ComboboxList>
          {(f) => (
            <ComboboxItem key={f} value={f}>
              {f}
            </ComboboxItem>
          )}
        </ComboboxList>
        <ComboboxEmpty>No frameworks match your query.</ComboboxEmpty>
      </ComboboxContent>
    </Combobox>
  ),
};

export const Disabled: Story = {
  args: { disabled: true },
  render: (args) => (
    <Combobox {...args} items={frameworks1}>
      <ComboboxInput label="Select framework…" disabled={args.disabled} />
      <ComboboxContent>
        <ComboboxList>
          {(f) => (
            <ComboboxItem key={f} value={f}>
              {f}
            </ComboboxItem>
          )}
        </ComboboxList>
        <ComboboxEmpty>No results found.</ComboboxEmpty>
      </ComboboxContent>
    </Combobox>
  ),
};
