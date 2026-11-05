const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

export function formatRelativeTime(value: string | null) {
  if (!value) return "Never";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Never";

  const diffMs = date.getTime() - Date.now();
  const absDiffMs = Math.abs(diffMs);

  if (absDiffMs < MINUTE_MS) return "just now";

  const relativeTimeFormat = new Intl.RelativeTimeFormat(undefined, {
    numeric: "always",
  });

  if (absDiffMs < HOUR_MS) {
    return relativeTimeFormat.format(Math.round(diffMs / MINUTE_MS), "minute");
  }

  if (absDiffMs < DAY_MS) {
    return relativeTimeFormat.format(Math.round(diffMs / HOUR_MS), "hour");
  }

  return relativeTimeFormat.format(Math.round(diffMs / DAY_MS), "day");
}
