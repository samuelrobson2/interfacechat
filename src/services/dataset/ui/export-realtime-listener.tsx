import { useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { useSessionStore } from "@/services/auth";
import { queryClient } from "@/shared/api/query-client";
import { openInNewTab } from "@/shared/lib/js";
import { toast } from "@/shared/ui/kit/sonner-toast";
import { datasetQueryOptions } from "../model/dataset-query-options";
import { CONFIG } from "@/shared/model/config";

const EXPORT_NOTIFICATIONS_SNAPSHOT = "export_notifications_snapshot";
const EXPORT_DATASET_READY = "export_dataset_ready";
const EXPORT_NOTIFICATIONS_ACK = "export_notifications_ack";
const EXPORT_REALTIME_NAMESPACE = "/export-realtime";
const LOCAL_NOTIFICATION_ID_PREFIX = "local-";

type ExportNotificationRow = {
  id: string;
  dataset_id: string;
  destination: string;
  url: string;
  dataset_name: string | null;
  created_at: string;
};

type SnapshotPayload = {
  notifications?: ExportNotificationRow[];
};

type ExportDatasetReadyPayload = {
  notification_id: string | null;
  dataset_id: string;
  destination: string;
  url: string;
  dataset_name: string | null;
};

type AckPayload = {
  ok: true;
  deleted_ids: string[];
};

const DESTINATION_LABELS: Record<string, string> = {
  huggingface: "Hugging Face",
  kaggle: "Kaggle",
  google_sheets: "Google Sheets",
};

const getApiOrigin = (apiBaseUrl: string) => {
  try {
    return new URL(apiBaseUrl).origin;
  } catch {
    return apiBaseUrl.replace(/\/api\/v\d+\/?$/, "");
  }
};

const toExportNotificationRow = (
  payload: ExportDatasetReadyPayload,
): ExportNotificationRow => ({
  id:
    payload.notification_id ??
    `${LOCAL_NOTIFICATION_ID_PREFIX}${payload.dataset_id}-${payload.destination}-${payload.url}`,
  dataset_id: payload.dataset_id,
  destination: payload.destination,
  url: payload.url,
  dataset_name: payload.dataset_name,
  created_at: new Date().toISOString(),
});

const getDestinationLabel = (destination: string) =>
  DESTINATION_LABELS[destination] ?? destination;

export function ExportRealtimeListener() {
  const [notifications, setNotifications] = useState<ExportNotificationRow[]>([]);
  const userId = useSessionStore((state) => state.user?.user_id);
  const socketRef = useRef<Socket | null>(null);
  const shownNotificationIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    let isCancelled = false;
    const shownNotificationIds = shownNotificationIdsRef.current;

    const connect = async () => {
      if (!userId) return;

      const token = await useSessionStore.getState().getToken();
      if (isCancelled || !token) return;

      const socket = io(
        `${getApiOrigin(CONFIG.API_BASE_URL)}${EXPORT_REALTIME_NAMESPACE}`,
        {
          path: "/socket.io",
          transports: ["websocket", "polling"],
          auth: { token },
        },
      );
      socketRef.current = socket;

      socket.on(EXPORT_NOTIFICATIONS_SNAPSHOT, (payload: SnapshotPayload) => {
        const snapshotNotifications = payload.notifications ?? [];
        setNotifications(snapshotNotifications);

        const uniqueDatasetIds = new Set(
          snapshotNotifications.map((item) => item.dataset_id),
        );
        for (const datasetId of uniqueDatasetIds) {
          void queryClient.invalidateQueries(
            datasetQueryOptions.datasetExportLinks(datasetId),
          );
        }
      });

      socket.on(EXPORT_DATASET_READY, (payload: ExportDatasetReadyPayload) => {
        const nextNotification = toExportNotificationRow(payload);
        setNotifications((prev) => [nextNotification, ...prev]);

        void queryClient.invalidateQueries(
          datasetQueryOptions.datasetExportLinks(payload.dataset_id),
        );
      });
    };

    void connect();

    return () => {
      isCancelled = true;
      socketRef.current?.disconnect();
      socketRef.current = null;
      shownNotificationIds.clear();
      setNotifications([]);
    };
  }, [userId]);

  useEffect(() => {
    if (notifications.length === 0) return;

    const socket = socketRef.current;
    const ackIds: string[] = [];

    for (const notification of notifications) {
      if (shownNotificationIdsRef.current.has(notification.id)) continue;

      shownNotificationIdsRef.current.add(notification.id);

      const destinationLabel = getDestinationLabel(notification.destination);
      const datasetLabel = notification.dataset_name ?? "Dataset";

      toast.success(`${datasetLabel} export is ready`, {
        description: `Your dataset was exported to ${destinationLabel}.`,
        button: {
          label: "Open",
          onClick: () => openInNewTab(notification.url),
        },
      });

      if (!notification.id.startsWith(LOCAL_NOTIFICATION_ID_PREFIX)) {
        ackIds.push(notification.id);
      }
    }

    if (!socket?.connected || ackIds.length === 0) return;

    socket.emit(
      EXPORT_NOTIFICATIONS_ACK,
      { ids: ackIds },
      (response: AckPayload | undefined) => {
        if (!response?.ok) return;
        setNotifications((prev) =>
          prev.filter((item) => !response.deleted_ids.includes(item.id)),
        );
      },
    );
  }, [notifications]);

  return null;
}
