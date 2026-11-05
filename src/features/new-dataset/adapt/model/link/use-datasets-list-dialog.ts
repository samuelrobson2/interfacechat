import { useLinkImportStore } from "./link-import-store";

export function useDatasetsListDialog() {
  const linkImportDatasets = useLinkImportStore(
    (state) => state.linkImportDatasets,
  );
  const selectedDatasets = useLinkImportStore(
    (state) => state.selectedDatasets,
  );
  const setSelectedDatasets = useLinkImportStore(
    (state) => state.setSelectedDatasets,
  );

  const handleSelectionChange = (id: string, selected: boolean) => {
    const newSelected = new Set(selectedDatasets);
    if (selected) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedDatasets(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedDatasets.size === linkImportDatasets?.length) {
      setSelectedDatasets(new Set());
    } else {
      setSelectedDatasets(new Set(linkImportDatasets || []));
    }
  };

  return {
    handleSelectionChange,
    toggleSelectAll,
  };
}
