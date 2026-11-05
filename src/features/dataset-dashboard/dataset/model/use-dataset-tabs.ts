import { useSearchParamsTabs } from "@/shared/lib/react/use-search-params-tabs";

export type DatasetTabs =
  | "measure"
  | "view"
  | "share"
  | "finetune"
  | "api"
  | "interfaces";
const DATASET_TABS = [
  "measure",
  "view",
  "share",
  "finetune",
  "api",
  "interfaces",
] as const;

export function useDatasetTabs() {
  return useSearchParamsTabs<DatasetTabs>(DATASET_TABS, "measure");
}
