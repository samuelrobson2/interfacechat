/** Max characters shown on Kaggle banner title before "…" */
export const DATASET_BANNER_NAME_MAX_LENGTH = 41;

export function truncateDatasetBannerName(name: string): string {
  if (name.length <= DATASET_BANNER_NAME_MAX_LENGTH) return name;
  return `${name.slice(0, DATASET_BANNER_NAME_MAX_LENGTH)}...`;
}
