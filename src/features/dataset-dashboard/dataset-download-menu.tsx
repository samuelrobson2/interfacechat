import { CommandGroup, CommandItem } from "@/shared/ui/kit/command";
import { PopupButton } from "@/shared/ui/popup-button";
import { useState } from "react";
import {
  useDatasetDownload,
  type DatasetFileFormat,
} from "./use-dataset-download";

export function DatasetDownloadMenu({
  datasetName,
  datasetId,
  renderTrigger,
}: {
  datasetName?: string;
  datasetId?: string;
  renderTrigger: (isLoading: boolean) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const { downloadOptions, downloadDataset, isPending } = useDatasetDownload();

  const handleSelect = (format: string) => {
    downloadDataset({
      datasetId,
      fileFormat: format as DatasetFileFormat,
      datasetName,
    });
    setOpen(false);
  };

  return (
    <PopupButton
      open={open}
      onOpenChange={setOpen}
      search={false}
      contentProps={{
        align: "center",
        side: "bottom",
        className: "w-40",
      }}
      trigger={renderTrigger(isPending)}
    >
      <CommandGroup>
        {downloadOptions.map((option) => (
          <CommandItem
            key={option.value}
            value={option.value}
            onSelect={handleSelect}
          >
            {option.title}
          </CommandItem>
        ))}
      </CommandGroup>
    </PopupButton>
  );
}
