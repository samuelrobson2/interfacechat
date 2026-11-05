import type { ImportSourceProvider } from "@/services/settings";
import { Button } from "@/shared/ui/kit/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/kit/dialog";
import { Text } from "@/shared/ui/kit/text";
import { VirtualList } from "@/shared/ui/virtual-list";
import { useNavigation } from "react-router-dom";
import { useLinkImportStore } from "../model/link/link-import-store";
import { useDatasetsListDialog } from "../model/link/use-datasets-list-dialog";
import { useLinkUpload } from "../model/link/use-link-upload";
import { LinkImportDatasetDialogError } from "../ui/link-import-dataset-dialog-error";
import { LinkImportDatasetDialogItem } from "../ui/link-import-dataset-dialog-item";
import { LinkImportDatasetDialogProgress } from "../ui/link-import-dataset-dialog-progress";

const mapProviderToName: Record<ImportSourceProvider, string> = {
  huggingface: "Hugging Face",
  kaggle: "Kaggle",
  "remote-url": "Remote URL",
};

export function LinkImportDatasetsListDialog() {
  const isNavigating = Boolean(useNavigation().location);
  const openDatasetsListDialog = useLinkImportStore(
    (state) => state.openDatasetsListDialog,
  );
  const selectedDatasets = useLinkImportStore(
    (state) => state.selectedDatasets,
  );
  const setOpenDatasetsListDialog = useLinkImportStore(
    (state) => state.setOpenDatasetsListDialog,
  );
  const resetDatasetsDialog = useLinkImportStore(
    (state) => state.resetDatasetsDialog,
  );

  const {
    uploadDatasets,
    datasetFilesProgress,
    errorProgress,
    errorUpload,
    isDatasetUploadingProgress,
    isUploadPending,
    resetUpload,
  } = useLinkUpload();

  const { handleSelectionChange, toggleSelectAll } = useDatasetsListDialog();

  const linkImportUrl = useLinkImportStore((state) => state.linkImportUrl);
  const linkImportDatasets = useLinkImportStore(
    (state) => state.linkImportDatasets,
  );
  const selectedSource = useLinkImportStore((state) => state.selectedSource);

  const handleOpenChange = (open: boolean) => {
    setOpenDatasetsListDialog(open);

    if (!open) {
      resetUpload();
      resetDatasetsDialog();
    }
  };

  const renderContent = () => {
    if (errorProgress)
      return (
        <LinkImportDatasetDialogError
          error={errorProgress}
          onTryAgain={() => handleOpenChange(false)}
        />
      );

    if (isDatasetUploadingProgress || isNavigating)
      return (
        <LinkImportDatasetDialogProgress filesProgress={datasetFilesProgress} />
      );

    if (!linkImportDatasets || linkImportDatasets.length === 0) {
      return (
        <>
          <DialogHeader>
            <DialogTitle>No datasets found</DialogTitle>
            <DialogDescription>
              We couldn't find any datasets in this{" "}
              {mapProviderToName[selectedSource!]} repository. Please make sure
              you're using a dataset with a supported file format: CSV, JSON,
              JSONL, Parquet, PDF, DOCX, PPTX, XLSX, HTML, ZIP, TXT
            </DialogDescription>
          </DialogHeader>
          {errorUpload && <Text color="error">{errorUpload}</Text>}
          <DialogFooter />
        </>
      );
    }

    return (
      <>
        <DialogHeader>
          <DialogTitle>Select the datasets</DialogTitle>
          <DialogDescription>
            We detected multiple files in this{" "}
            {mapProviderToName[selectedSource!]} repository. Choose which
            datasets you'd like to import and continue working with. All tabular
            files in a batch must share the same columns.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6 overflow-hidden">
          <Button className="self-end" variant="link" onClick={toggleSelectAll}>
            Select all
          </Button>

          <VirtualList
            items={linkImportDatasets}
            getItemKey={(dataset) => dataset}
            gap={32}
            renderItem={(dataset) => (
              <LinkImportDatasetDialogItem
                dataset_id={dataset}
                name={dataset}
                isSelected={selectedDatasets.has(dataset)}
                onSelectionChange={handleSelectionChange}
              />
            )}
          />

          {errorUpload && <Text color="error">{errorUpload}</Text>}
        </div>
        <DialogFooter>
          <Button
            disabled={selectedDatasets.size === 0}
            className="flex-1"
            onClick={() =>
              uploadDatasets(
                {
                  url: linkImportUrl!,
                  files: Array.from(selectedDatasets),
                },
                selectedSource!,
              )
            }
            isLoading={isUploadPending}
          >
            Continue
          </Button>
        </DialogFooter>
      </>
    );
  };

  return (
    <Dialog open={openDatasetsListDialog} onOpenChange={handleOpenChange}>
      <DialogContent
        onInteractOutside={(e) =>
          isDatasetUploadingProgress && e.preventDefault()
        }
      >
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
