import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import {
  FileUpload,
  FileUploadAttachmentContent,
  FileUploadAttachmentTrigger,
  FileUploadContent,
  FileUploadTrigger,
} from ".";

const meta: Meta<typeof FileUpload> = {
  title: "UI/Kit/FileUpload",
  component: FileUpload,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof FileUpload>;

export const Default: Story = {
  render: () => {
    const [files, setFiles] = useState<Map<string, File>>(new Map());
    return (
      <FileUpload files={files}>
        <FileUploadTrigger onChange={setFiles} />
        <FileUploadContent onRemove={() => setFiles(new Map())} />
      </FileUpload>
    );
  },
};

export const WithFiles: Story = {
  render: () => {
    const mockFile = new File([""], "report.pdf", { type: "application/pdf" });
    const mockFiles = new Map([["report.pdf-0", mockFile]]);
    const [files, setFiles] = useState<Map<string, File>>(mockFiles);
    return (
      <FileUpload files={files}>
        <FileUploadTrigger onChange={setFiles} />
        <FileUploadContent onRemove={() => setFiles(new Map())} />
      </FileUpload>
    );
  },
};

export const MultipleFiles: Story = {
  render: () => {
    const [files, setFiles] = useState<Map<string, File>>(new Map());
    return (
      <FileUpload files={files}>
        <FileUploadTrigger onChange={setFiles} maxFiles={5} multiple />
        <FileUploadContent onRemove={() => setFiles(new Map())} />
      </FileUpload>
    );
  },
};

export const Disabled: Story = {
  render: () => (
    <FileUpload files={new Map()}>
      <FileUploadTrigger disabled />
    </FileUpload>
  ),
};

export const AttachmentTrigger: Story = {
  render: () => {
    const [files, setFiles] = useState<Map<string, File>>(new Map());
    const firstEntry = Array.from(files.entries())[0];

    const handleRemove = (key: string) => {
      const updated = new Map(files);
      updated.delete(key);
      setFiles(updated);
    };

    return (
      <FileUpload files={files}>
        <div className="flex items-center gap-2">
          <FileUploadAttachmentTrigger
            onChange={setFiles}
            tooltipContent="Attach file"
          />
          {firstEntry && (
            <FileUploadAttachmentContent
              fileKey={firstEntry[0]}
              file={firstEntry[1]}
              onRemove={handleRemove}
            />
          )}
        </div>
      </FileUpload>
    );
  },
};

export const AttachmentWithFile: Story = {
  render: () => {
    const mockFile = new File([""], "attachment.pdf", {
      type: "application/pdf",
    });
    const mockFiles = new Map([["attachment.pdf-0", mockFile]]);
    const [files, setFiles] = useState<Map<string, File>>(mockFiles);
    const firstEntry = Array.from(files.entries())[0];

    const handleRemove = (key: string) => {
      const updated = new Map(files);
      updated.delete(key);
      setFiles(updated);
    };

    return (
      <FileUpload files={files}>
        <div className="flex items-center gap-2">
          <FileUploadAttachmentTrigger onChange={setFiles} />
          {firstEntry && (
            <FileUploadAttachmentContent
              fileKey={firstEntry[0]}
              file={firstEntry[1]}
              onRemove={handleRemove}
            />
          )}
        </div>
      </FileUpload>
    );
  },
};

export const AttachmentTriggerChatStyle: Story = {
  render: () => {
    const [files, setFiles] = useState<Map<string, File>>(new Map());
    const firstEntry = Array.from(files.entries())[0];

    const handleRemove = (key: string) => {
      const updated = new Map(files);
      updated.delete(key);
      setFiles(updated);
    };

    return (
      <FileUpload files={files}>
        <div className="flex items-center gap-2">
          <FileUploadAttachmentTrigger
            onChange={setFiles}
            className="size-8 rounded-[60px] p-0 [&_svg]:size-4"
            tooltipContent="Attach file"
          />
          {firstEntry && (
            <FileUploadAttachmentContent
              fileKey={firstEntry[0]}
              file={firstEntry[1]}
              onRemove={handleRemove}
            />
          )}
        </div>
      </FileUpload>
    );
  },
};
