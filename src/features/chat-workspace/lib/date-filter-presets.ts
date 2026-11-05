// Date presets for the dashboard filter. Each preset resolves to an
// ISO-8601 `created_after` timestamp passed to GET /chat/sessions.

export type DateFilterPresetId =
  | "today"
  | "last_7_days"
  | "last_30_days"
  | "last_3_months"
  | "last_year";

export type DateFilterPreset = {
  id: DateFilterPresetId;
  label: string;
};

export const DATE_FILTER_PRESETS: DateFilterPreset[] = [
  { id: "today", label: "Today" },
  { id: "last_7_days", label: "Last 7 days" },
  { id: "last_30_days", label: "Last 30 days" },
  { id: "last_3_months", label: "Last 3 months" },
  { id: "last_year", label: "Last year" },
];

export const getCreatedAfterFromPreset = (id: DateFilterPresetId): string => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  switch (id) {
    case "today":
      break;
    case "last_7_days":
      start.setDate(start.getDate() - 7);
      break;
    case "last_30_days":
      start.setDate(start.getDate() - 30);
      break;
    case "last_3_months":
      start.setMonth(start.getMonth() - 3);
      break;
    case "last_year":
      start.setFullYear(start.getFullYear() - 1);
      break;
  }

  return start.toISOString();
};

export const getDateFilterPresetLabel = (id: DateFilterPresetId): string =>
  DATE_FILTER_PRESETS.find((preset) => preset.id === id)?.label ?? "";
