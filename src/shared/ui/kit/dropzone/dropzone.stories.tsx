import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
  DropzoneError,
  DropzoneUploading,
} from ".";

const meta: Meta<typeof Dropzone> = {
  title: "UI/Kit/Dropzone",
  component: Dropzone,
  tags: ["autodocs"],
  argTypes: {
    disabled: {
      control: "boolean",
      description: "Disables drag and drop and file browsing",
    },
    maxFiles: {
      control: "number",
      description: "Maximum number of files allowed",
    },
    isError: {
      control: "boolean",
      description: "Puts the dropzone into error state",
    },
    uploading: {
      control: "boolean",
      description: "Puts the dropzone into uploading state",
    },
  },
  args: {
    disabled: false,
    maxFiles: 1,
    isError: false,
    uploading: false,
  },
};

export default meta;
type Story = StoryObj<typeof Dropzone>;

export const Interactive: Story = {
  render: (args) => {
    const [files, setFiles] = useState<File[] | undefined>(undefined);

    const handleDrop = (acceptedFiles: File[]) => {
      setFiles(acceptedFiles);
    };

    return (
      <Dropzone {...args} src={files} onDrop={handleDrop} className="w-[480px]">
        <DropzoneEmptyState caption="Supports PDF, CSV up to 50MB" />
        <DropzoneContent onRemove={() => setFiles(undefined)} />
        <DropzoneUploading progress={42} />
        <DropzoneError
          title="Upload failed"
          caption="File type not supported. Please use PDF or CSV."
        />
      </Dropzone>
    );
  },
};

export const Empty: Story = {
  render: (args) => (
    <Dropzone {...args} className="w-[480px]">
      <DropzoneEmptyState caption="Supports PDF, CSV up to 50MB" />
    </Dropzone>
  ),
};

export const Uploading: Story = {
  render: (args) => (
    <Dropzone {...args} uploading className="w-[480px]">
      <DropzoneUploading progress={42} />
    </Dropzone>
  ),
};

export const WithContent: Story = {
  render: (args) => {
    const mockFile = new File([""], "dataset.csv", { type: "text/csv" });
    return (
      <Dropzone {...args} src={[mockFile]} className="w-[480px]">
        <DropzoneContent />
      </Dropzone>
    );
  },
};

export const Error: Story = {
  render: (args) => (
    <Dropzone {...args} isError className="w-[480px]">
      <DropzoneError
        title="Upload failed"
        caption="File type not supported. Please use PDF or CSV."
      />
    </Dropzone>
  ),
};
