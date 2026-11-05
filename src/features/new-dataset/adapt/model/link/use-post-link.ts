import { connectKaggleOAuth, useSessionStore } from "@/services/auth";
import {
  KAGGLE_OAUTH_PROVIDER,
  settingsQueryOptions,
  type ImportSourceProvider,
} from "@/services/settings";
import { rqClient } from "@/shared/api/instance";
import { useQuery } from "@tanstack/react-query";
import { useLinkImportStore } from "./link-import-store";
import { useState } from "react";
import { isApiError } from "@/shared/api/api-error";

export function usePostLink() {
  const user = useSessionStore((state) => state.user);
  // No real session under the dev auth bypass — skip the query instead of
  // crashing on a null user (isConnected below just falls back to "no key").
  const { data: settings } = useQuery({
    ...settingsQueryOptions.settings(user?.user_id ?? ""),
    enabled: !!user?.user_id,
  });

  const [error, setError] = useState<Partial<Record<ImportSourceProvider, string | string[]>>>();

  const setOpenDatasetsListDialog = useLinkImportStore(
    (state) => state.setOpenDatasetsListDialog,
  );
  const setLinkImportUrl = useLinkImportStore(
    (state) => state.setLinkImportUrl,
  );
  const setLinkImportDatasets = useLinkImportStore(
    (state) => state.setLinkImportDatasets,
  );
  const setOpenAddApiKeyDialog = useLinkImportStore(
    (state) => state.setOpenAddApiKeyDialog,
  );

  const {
    mutateAsync: postHuggingfaceFiles,
    isPending: isPostHuggingfacePending,
  } = rqClient.useMutation("get", "/datasets/huggingface/files");
  const { mutateAsync: postKaggleFiles, isPending: isPostKagglePending } =
    rqClient.useMutation("get", "/datasets/kaggle/files");

  const postFiles = async (url: string, provider: ImportSourceProvider) => {
    switch (provider) {
      case "huggingface":
        return await postHuggingfaceFiles({
          params: {
            query: {
              huggingfaceUrl: url,
            },
          },
        });
      case "kaggle":
        return await postKaggleFiles({
          params: {
            query: {
              kaggleUrl: url,
            },
          },
        });
      case "remote-url":
        return null;
    }
  };

  const postLink = async (url: string, provider: ImportSourceProvider) => {
    try {
      setError((prev) => {
        if (!prev) return undefined;
        const newErrors = { ...prev };
        delete newErrors[provider];
        return Object.keys(newErrors).length > 0 ? newErrors : undefined;
      });
      setLinkImportUrl(undefined);

      const data = await postFiles(url, provider);

      if (!data) return;

      setLinkImportDatasets(data);
      setOpenDatasetsListDialog(true);
      setLinkImportUrl(url);
    } catch (error) {
      if (!isApiError(error)) {
        setError((prev) => ({
          ...prev,
          [provider]: error instanceof Error ? error.message : "Unknown error",
        }));
        return;
      }

      const isConnected =
        provider === "kaggle"
          ? settings?.apiKeys.find(
              (key) => key.provider === KAGGLE_OAUTH_PROVIDER,
            )?.exists
          : settings?.apiKeys.find((key) => key.provider === provider)?.exists;

      if (error.statusCode === 401 && !isConnected) {
        if (provider === "kaggle") {
          connectKaggleOAuth();
          return;
        }

        setOpenAddApiKeyDialog(true);
        return;
      }

      setError((prev) => ({
        ...prev,
        [provider]: error.message,
      }));
    }
  };

  return {
    postLink,
    isPending: isPostHuggingfacePending || isPostKagglePending,
    errorMessage: error,
  };
}
