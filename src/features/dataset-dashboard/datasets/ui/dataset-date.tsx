export function DatasetDate({ value }: { value: string }) {
  const date = new Date(value);
  const tooltip = date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
  const formatted = date.toLocaleDateString("en-US", {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
  });
  return <span title={tooltip}>{formatted}</span>;
}
