import type { ImportSourceProvider } from "@/services/settings";
import { create } from "zustand";

interface LinkImportState {
  selectedSource: ImportSourceProvider | undefined;
  linkImportUrl: string | undefined;
  linkImportDatasets: string[] | undefined;
  selectedDatasets: Set<string>;
  datasetId: string | null;
  openDatasetsListDialog: boolean;
  openAddApiKeyDialog: boolean;
}

interface LinkImportActions {
  setSelectedSource: (source: ImportSourceProvider | undefined) => void;
  setLinkImportUrl: (url: string | undefined) => void;
  setLinkImportDatasets: (datasets: string[] | undefined) => void;
  setSelectedDatasets: (datasets: Set<string>) => void;
  setDatasetId: (datasetId: string | null) => void;
  setOpenDatasetsListDialog: (open: boolean) => void;
  setOpenAddApiKeyDialog: (open: boolean) => void;
  resetDatasetsDialog: () => void;
}

type LinkImportStore = LinkImportState & LinkImportActions;

const initialState: LinkImportState = {
  selectedSource: undefined,
  linkImportUrl: undefined,
  linkImportDatasets: undefined,
  selectedDatasets: new Set(),
  datasetId: null,
  openDatasetsListDialog: false,
  openAddApiKeyDialog: false,
};

export const useLinkImportStore = create<LinkImportStore>()((set) => ({
  ...initialState,

  setSelectedSource: (selectedSource) => set({ selectedSource }),
  setLinkImportUrl: (linkImportUrl) => set({ linkImportUrl }),
  setLinkImportDatasets: (linkImportDatasets) => set({ linkImportDatasets }),
  setSelectedDatasets: (selectedDatasets) => set({ selectedDatasets }),
  setDatasetId: (datasetId) => set({ datasetId }),
  setOpenDatasetsListDialog: (openDatasetsListDialog) =>
    set({ openDatasetsListDialog }),
  setOpenAddApiKeyDialog: (openAddApiKeyDialog) => set({ openAddApiKeyDialog }),
  resetDatasetsDialog: () =>
    set({
      linkImportUrl: undefined,
      linkImportDatasets: undefined,
      selectedDatasets: new Set(),
      datasetId: null,
      openDatasetsListDialog: false,
    }),
}));
