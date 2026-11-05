import { settingsQueryOptions } from "@/services/settings";
import { rqClient } from "@/shared/api/instance";
import { queryClient } from "@/shared/api/query-client";
import { CONFIG } from "@/shared/model/config";
import { toast } from "@/shared/ui/kit/sonner-toast";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useSessionStore } from "./session-store";

export async function getKaggleOAuthConnectUrl(
  datasetId?: string,
): Promise<string> {
  const token = await useSessionStore.getState().getToken();
  const parts: string[] = [];
  if (datasetId) {
    parts.push(`datasetId=${datasetId}`);
  }
  if (token) {
    parts.push(`token=${encodeURIComponent(token)}`);
  }
  const query = parts.join("&");
  return `${CONFIG.API_BASE_URL}/oauth/kaggle/connect${query ? `?${query}` : ""}`;
}

export function connectKaggleOAuth(datasetId?: string) {
  void getKaggleOAuthConnectUrl(datasetId).then((url) =>
    window.location.assign(url),
  );
}

export function useDisconnectKaggleOAuth() {
  const user = useSessionStore((state) => state.user);
  const { mutateAsync, isPending } = rqClient.useMutation(
    "delete",
    "/oauth/kaggle",
  );

  const disconnectKaggleOAuth = async (onSuccess?: () => void) => {
    await mutateAsync({});
    if (user?.user_id) {
      await queryClient.invalidateQueries(
        settingsQueryOptions.settings(user.user_id),
      );
    }
    onSuccess?.();
  };

  return {
    disconnectKaggleOAuth,
    isPending,
  };
}

export function useKaggleOAuthCallback() {
  const user = useSessionStore((state) => state.user);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const status = searchParams.get("kaggle");
    if (!status) return;

    if (status === "connected") {
      toast.success("Kaggle account connected");
      if (user?.user_id) {
        void queryClient.invalidateQueries(
          settingsQueryOptions.settings(user.user_id),
        );
      }
    } else if (status === "error") {
      toast.error("Could not connect Kaggle account");
    }

    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.delete("kaggle");
    setSearchParams(nextSearchParams, { replace: true });
  }, [searchParams, setSearchParams, user?.user_id]);
}
