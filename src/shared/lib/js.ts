// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      func(...args);
      timeout = null;
    }, wait);
  };
};

export const downloadFile = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

const withExtensionFromBlob = (filename: string, blob: Blob) => {
  if (/\.[^/.]+$/.test(filename)) return filename;
  const ext = blob.type.split("/")[1];
  return ext ? `${filename}.${ext}` : filename;
};

export const downloadImage = async (src: string, filename: string) => {
  try {
    const response = await fetch(src, { mode: "cors" });
    if (!response.ok) throw new Error(`Failed to fetch image: ${response.status}`);
    const blob = await response.blob();
    downloadFile(blob, withExtensionFromBlob(filename, blob));
  } catch {
    // Fallback for opaque/no-CORS responses: best-effort direct link.
    const link = document.createElement("a");
    link.href = src;
    link.download = filename;
    link.rel = "noopener noreferrer";
    link.target = "_blank";
    link.click();
  }
};

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const openInNewTab = (url: string) => {
  window.open(url, "_blank", "noopener,noreferrer");
};

export const getNumericValue = (value: string) => {
  const numericValue = value.replace(/\D/g, "");
  return numericValue === "" ? 0 : parseInt(numericValue, 10);
};
