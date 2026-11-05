import { queryClient } from "@/shared/api/query-client";
import { CONFIG } from "@/shared/model/config";
import { QueryClientProvider } from "@tanstack/react-query";
import { PostHogProvider } from "posthog-js/react";

const options = {
  api_host: CONFIG.POSTHOG_HOST,
  defaults: "2025-11-30",
  disable_session_recording: window.location.hostname === "localhost",
} as const;

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PostHogProvider apiKey={CONFIG.POSTHOG_API_KEY} options={options}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </PostHogProvider>
  );
}
