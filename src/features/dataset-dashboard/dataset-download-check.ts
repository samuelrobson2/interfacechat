const DOWNLOAD_READY_THRESHOLD = 10;

export function isDownloadReady(progressPercentage?: number | null) {
  return progressPercentage && progressPercentage >= DOWNLOAD_READY_THRESHOLD;
}

export function isDownloadDisabled(progressPercentage?: number | null) {
  return progressPercentage
    ? progressPercentage < DOWNLOAD_READY_THRESHOLD
    : true;
}
