import { rqClient } from "@/shared/api/instance";

export type ChatSessionsQueryParams = {
  directory_id?: string;
  q?: string;
  created_after?: string;
  cursor?: string;
  limit?: number;
};

export type ChatDirectoriesQueryParams = {
  category?: string;
  domain_group?: string;
  created_after?: string;
  cursor?: string;
  limit?: number;
};

export type ChartSessionsQueryParams = {
  cursor?: string;
  limit?: number;
};

export const chatQueryOptions = {
  sessions: (params: ChatSessionsQueryParams = {}) =>
    rqClient.queryOptions("get", "/chat/sessions", {
      params: { query: params },
    }),
  directories: (params: ChatDirectoriesQueryParams = {}) =>
    rqClient.queryOptions("get", "/chat/directories", {
      params: { query: params },
    }),
  domainGroups: () => rqClient.queryOptions("get", "/chat/domain-groups", {}),
  session: (sessionId: string) =>
    rqClient.queryOptions("get", "/chat/sessions/{sessionId}", {
      params: {
        path: {
          sessionId,
        },
      },
    }),
  messages: (sessionId: string, cursor?: string, limit?: number) =>
    rqClient.queryOptions("get", "/chat/sessions/{sessionId}/messages", {
      params: {
        path: {
          sessionId,
        },
        query: {
          cursor,
          limit,
        },
      },
    }),
  attachmentDownloadUrl: (sessionId: string, attachmentId: string) =>
    rqClient.queryOptions(
      "get",
      "/chat/sessions/{sessionId}/attachments/{attachmentId}/download-url",
      {
        params: {
          path: { sessionId, attachmentId },
        },
      },
    ),
  chartSessions: (params: ChartSessionsQueryParams = {}) =>
    rqClient.queryOptions("get", "/chart-sessions", {
      params: { query: params },
    }),
  chartSession: (sessionId: string) =>
    rqClient.queryOptions("get", "/chart-sessions/{sessionId}", {
      params: { path: { sessionId } },
    }),
  chartSessionMessages: (sessionId: string, cursor?: string, limit?: number) =>
    rqClient.queryOptions("get", "/chart-sessions/{sessionId}/messages", {
      params: {
        path: { sessionId },
        query: { cursor, limit },
      },
    }),
  chartJob: (sessionId: string, jobId: string) =>
    rqClient.queryOptions("get", "/chart-sessions/{sessionId}/jobs/{jobId}", {
      params: { path: { sessionId, jobId } },
    }),
  chartQuickInsights: (datasetId?: string) =>
    rqClient.queryOptions("get", "/chart-sessions/quick-insights", {
      params: {
        query: datasetId ? { dataset_id: datasetId } : {},
      },
    }),
} as const;
