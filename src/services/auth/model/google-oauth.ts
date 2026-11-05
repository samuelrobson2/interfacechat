import { CONFIG } from "@/shared/model/config";
import { useSessionStore } from "./session-store";

export async function getGoogleOAuthConnectUrl(
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
  return `${CONFIG.API_BASE_URL}/oauth/google/connect${query ? `?${query}` : ""}`;
}

export function connectGoogleOAuth(datasetId?: string) {
  void getGoogleOAuthConnectUrl(datasetId).then((url) =>
    window.location.assign(url),
  );
}
