import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../button";
import { Toast, Toaster, toast } from ".";

const meta: Meta<typeof Toast> = {
  title: "UI/Kit/Sonner",
  component: Toast,
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: "select",
      options: ["success", "error", "warning", "info", "loading"],
      description: "Visual type of the toast",
    },
    title: {
      control: "text",
      description: "Toast title text",
    },
    description: {
      control: "text",
      description: "Optional description below the title",
    },
  },
  args: {
    id: "preview",
    type: "success",
    title: "Operation successful",
    description: "Your changes have been saved.",
  },
};

export default meta;
type Story = StoryObj<typeof Toast>;

export const Preview: Story = {};

// Showcase: multiple instances — args not applicable
export const AllTypes: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Toast
        id="s"
        type="success"
        title="Success"
        description="Operation completed successfully."
      />
      <Toast
        id="e"
        type="error"
        title="Error"
        description="Something went wrong. Please try again."
      />
      <Toast
        id="w"
        type="warning"
        title="Warning"
        description="This action may have unintended consequences."
      />
      <Toast
        id="i"
        type="info"
        title="Info"
        description="Here is some useful information for you."
      />
      <Toast
        id="l"
        type="loading"
        title="Loading"
        description="Please wait while we process your request."
      />
    </div>
  ),
};

export const WithButton: Story = {
  render: () => (
    <Toast
      id="btn"
      type="info"
      title="New update available"
      description="Version 2.0 is ready to install."
      button={{ label: "Update now", onClick: () => {} }}
    />
  ),
};

export const WithoutDescription: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Toast id="s" type="success" title="Saved!" />
      <Toast id="e" type="error" title="Failed to save" />
    </div>
  ),
};

// Showcase: live toasts via Toaster — args not applicable
export const LiveToaster: Story = {
  render: () => (
    <div className="flex flex-col gap-3 h-screen items-center justify-center">
      <Toaster />
      <div className="flex flex-wrap gap-2">
        <Button
          variant="secondary"
          size="48"
          onClick={() =>
            toast.success("Saved successfully!", {
              description: "Your data has been stored.",
            })
          }
        >
          Success
        </Button>
        <Button
          variant="secondary"
          size="48"
          onClick={() =>
            toast.error("Something went wrong", {
              description: "Please try again later.",
            })
          }
        >
          Error
        </Button>
        <Button
          variant="secondary"
          size="48"
          onClick={() =>
            toast.warning("Heads up!", {
              description: "This action is irreversible.",
            })
          }
        >
          Warning
        </Button>
        <Button
          variant="secondary"
          size="48"
          onClick={() =>
            toast.info("Did you know?", {
              description: "You can customize these toasts.",
            })
          }
        >
          Info
        </Button>
        <Button
          variant="secondary"
          size="48"
          onClick={() =>
            toast.loading("Processing...", { description: "Hang tight!" })
          }
        >
          Loading
        </Button>
      </div>
    </div>
  ),
};
