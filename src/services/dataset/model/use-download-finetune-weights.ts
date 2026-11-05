import { useState } from "react";
import { CONFIG } from "@/shared/model/config";
import { toast } from "@/shared/ui/kit/sonner-toast";

export function useDownloadFinetuneWeights() {
  const [isPending, setIsPending] = useState(false);

  const downloadFinetuneWeights = async (datasetId: string, jobId: string) => {
    const url = `${CONFIG.API_BASE_URL}/datasets/${encodeURIComponent(datasetId)}/finetune/jobs/${encodeURIComponent(jobId)}/download`;
    setIsPending(true);
    try {
      const controller = new AbortController();
      const response = await fetch(url, {
        method: "GET",
        credentials: "include",
        signal: controller.signal,
      });

      if (!response.ok) {
        try {
          const responseData = await response.json();
          toast.error(responseData?.message || "Could not download weights");
        } catch {
          toast.error("Could not download weights");
        }
        return;
      }

      // Stop the request and let the browser own the real download.
      controller.abort();
      window.location.href = url;
    } finally {
      window.setTimeout(() => setIsPending(false), 800);
    }
  };

  return {
    downloadFinetuneWeights,
    isPending,
    error: null,
  };
}
