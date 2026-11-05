import { useEffect, useMemo, useState } from "react";
import type { ApiSchemas } from "@/shared/api/schema";
import { toast } from "@/shared/ui/kit/sonner-toast";

function toLaunchPayloadText(
  launchPayload: ApiSchemas["LaunchFinetuneJobDto"] | undefined,
) {
  return JSON.stringify(launchPayload ?? {}, null, 2);
}

function parseLaunchPayload(text: string) {
  if (!text.trim()) return null;
  try {
    const parsed = JSON.parse(text) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return null;
    }
    return parsed as ApiSchemas["LaunchFinetuneJobDto"];
  } catch {
    return null;
  }
}

export function useConfirmRequestState(
  launchPayload: ApiSchemas["LaunchFinetuneJobDto"] | undefined,
) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [launchPayloadText, setLaunchPayloadText] = useState("");

  useEffect(() => {
    setLaunchPayloadText(toLaunchPayloadText(launchPayload));
  }, [launchPayload]);

  const parsedLaunchPayload = useMemo(
    () => parseLaunchPayload(launchPayloadText),
    [launchPayloadText],
  );
  const hasInvalidJson = Boolean(launchPayloadText.trim()) && !parsedLaunchPayload;

  const handleCopy = async () => {
    if (!launchPayloadText) return;
    try {
      await navigator.clipboard.writeText(launchPayloadText);
      toast.success("Copied to clipboard.");
    } catch {
      toast.error("Could not copy to clipboard.");
    }
  };

  return {
    isEditMode,
    setIsEditMode,
    launchPayloadText,
    setLaunchPayloadText,
    parsedLaunchPayload,
    hasInvalidJson,
    handleCopy,
  };
}
