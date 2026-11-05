import { AlertFilledIcon } from "@/shared/assets/icons/general/AlertFilled";
import { ArrowRightIcon } from "@/shared/assets/icons/outlined/ArrowRight";
import customSettingsImage from "@/shared/assets/images/custom-settings.png";
import { cn } from "@/shared/lib/css";
import { Button } from "@/shared/ui/kit/button";
import { Card } from "@/shared/ui/kit/card";
import {
  FileUpload,
  FileUploadAttachmentContent,
  FileUploadAttachmentTrigger,
} from "@/shared/ui/kit/file-upload";
import { Text } from "@/shared/ui/kit/text";
import { useState } from "react";
import { useControlBrandFiles } from "../model/use-control-brand-files";
import {
  ControlBrandSettingLayout,
  ControlBrandSettingTitle,
} from "../ui/control-brand-setting-layout";
import { ControlBrandSettingsTextarea } from "../ui/control-brand-settings-textarea";

const MAX_FILES = 3;

export function ControlBrandCustomSettings({
  brand_files,
}: {
  brand_files: Map<string, File>;
}) {
  const [prompt, setPrompt] = useState("");

  const {
    uploadFiles,
    removeFile,
    generateSystemPrompt,
    isFilesPending,
    isGeneratePending,
  } = useControlBrandFiles(brand_files);

  return (
    <ControlBrandSettingLayout className="flex-row gap-6.5">
      <img
        className="size-22.5"
        src={customSettingsImage}
        alt="Custom settings"
      />
      <div className="flex flex-col gap-4 w-full">
        <ControlBrandSettingTitle
          title="Custom settings"
        />

        <div className="flex items-start gap-3">
          <AlertFilledIcon className="shrink-0" pathClasses="fill-red-5" />
          <Text className="max-w-[700px]" variant="label" color="secondary">
            Warning: custom settings are applied to all adapted data. It is
            powerful steering and will limit flexibility in data adaption.
          </Text>
        </div>

        <Card className="gap-4">
          <ControlBrandSettingsTextarea
            value={prompt}
            onChange={(e) => setPrompt?.(e.target.value)}
            placeholder="Write your system preamble here or upload your brand guidelines, system prompt or internal policies around safety, tone, length, brand adherance. We will optimize it into a custom set of rules."
          />

          <div className="grid grid-cols-[1fr_auto] gap-2">
            <FileUpload
              files={brand_files}
              className={cn(
                "flex-row items-center overflow-hidden",
                isFilesPending && "opacity-50 cursor-not-allowed",
              )}
            >
              <FileUploadAttachmentTrigger
                className="shrink-0 size-10"
                multiple
                onChange={uploadFiles}
                disabled={brand_files.size >= MAX_FILES}
                accept=".txt, .pdf"
                tooltipContent={
                  brand_files.size >= MAX_FILES
                    ? "Max files reached"
                    : "Upload file"
                }
              />
              <div className="flex gap-2 overflow-hidden w-full">
                {Array.from(brand_files?.entries()).map(([fileKey, file]) => (
                  <FileUploadAttachmentContent
                    className="px-3 py-1.5"
                    textClassName="max-w-[85px]"
                    key={fileKey}
                    fileKey={fileKey}
                    file={file}
                    onRemove={removeFile}
                  />
                ))}
              </div>
            </FileUpload>

            <Button
              size="48"
              className="ml-auto px-4 py-2 h-10"
              onClick={() => generateSystemPrompt(prompt)}
              isLoading={isGeneratePending}
              disabled={isFilesPending || isGeneratePending}
            >
              Generate
              <ArrowRightIcon pathClasses="stroke-current" />
            </Button>
          </div>
        </Card>
      </div>
    </ControlBrandSettingLayout>
  );
}
