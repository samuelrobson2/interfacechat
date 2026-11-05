import { LayoutToggle } from "@/shared/ui/layout-toggle";

export type ChatPanelLayout = "side" | "stacked" | "message";

const OPTIONS: { value: ChatPanelLayout; label: string }[] = [
  { value: "message", label: "Main" },
  { value: "side", label: "Alternate 1" },
  { value: "stacked", label: "Stacked" },
];

/** Small fixed control (bottom-right) to switch between chat panel layouts. */
export function ChatLayoutToggle({
  value,
  onChange,
}: {
  value: ChatPanelLayout;
  onChange: (value: ChatPanelLayout) => void;
}) {
  return <LayoutToggle value={value} onChange={onChange} options={OPTIONS} />;
}
