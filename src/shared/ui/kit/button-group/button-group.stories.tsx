import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "@/shared/ui/kit/button";
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from ".";

const meta: Meta<typeof ButtonGroup> = {
  title: "UI/Kit/ButtonGroup",
  component: ButtonGroup,
  tags: ["autodocs"],
  argTypes: {
    orientation: { control: "radio", options: ["horizontal", "vertical"] },
  },
  args: {
    orientation: "horizontal",
  },
  render: (args) => (
    <ButtonGroup {...args}>
      <Button variant="secondary" size="48">
        Left
      </Button>
      <Button variant="secondary" size="48">
        Middle
      </Button>
      <Button variant="secondary" size="48">
        Right
      </Button>
    </ButtonGroup>
  ),
};

export default meta;
type Story = StoryObj<typeof ButtonGroup>;

export const Default: Story = {};

export const Vertical: Story = {
  args: { orientation: "vertical" },
};

export const WithSeparator: Story = {
  render: (args) => (
    <ButtonGroup {...args}>
      <Button variant="secondary" size="48">
        Action
      </Button>
      <ButtonGroupSeparator />
      <Button variant="secondary" size="48">
        More
      </Button>
    </ButtonGroup>
  ),
};

export const WithText: Story = {
  render: (args) => (
    <ButtonGroup {...args}>
      <ButtonGroupText>https://</ButtonGroupText>
      <Button variant="secondary" size="48">
        Visit
      </Button>
    </ButtonGroup>
  ),
};

export const TextSuffix: Story = {
  render: (args) => (
    <ButtonGroup {...args}>
      <Button variant="secondary" size="48">
        Search
      </Button>
      <ButtonGroupText>.com</ButtonGroupText>
    </ButtonGroup>
  ),
};
