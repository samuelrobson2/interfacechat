import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { ChatGradientFrame } from "@/services/chat";
import { cn } from "@/shared/lib/css";
import { Text } from "@/shared/ui/kit/text";

// ── DraftCard ───────────────────────────────────────────────────────────────
// A suggestion card: a gradient-framed, clickable card presenting an interface
// the user could build (icon + title + description). Extracted from the
// auto-interface homepage so it can be reused and browsed in the UI Kit gallery.

export type InterfaceDraft = {
  key: string;
  title: string;
  description: string;
  // Starter prompt dropped into the prompt box when this card is picked, for the
  // user to review and edit before continuing to the editor.
  prompt: string;
  icon: LucideIcon;
};

export function DraftCard({
  draft,
  selected,
  onSelect,
  layoutId,
  hideHeader = false,
}: {
  draft: InterfaceDraft;
  selected?: boolean;
  onSelect?: (draft: InterfaceDraft) => void;
  // When set, the card shares a layout id with the interface canvas so it
  // visually "grows into" the editor on select.
  layoutId?: string;
  // Drop the icon + title row, showing only the description (selection is then
  // signalled by tinting the description).
  hideHeader?: boolean;
}) {
  const Icon = draft.icon;
  return (
    <motion.div
      layoutId={layoutId}
      transition={{ layout: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } }}
      className="h-full w-full"
    >
      {/* Same static gradient-frame border as the chat suggestion cards —
          no cursor-tracking shimmer. */}
      <ChatGradientFrame asChild overlay blurAmount={2} className="h-full w-full">
        <button
          type="button"
          onClick={onSelect ? () => onSelect(draft) : undefined}
          className={cn(
            "flex h-full w-full flex-col gap-4 px-7 py-5 text-left",
            onSelect && "cursor-pointer transition active:scale-[0.96]",
          )}
        >
          {!hideHeader && (
            <div className="flex items-center gap-2">
              <Icon
                className={cn(
                  "size-4",
                  selected ? "text-[#7c6fda]" : "text-typography-primary",
                )}
              />
              <Text variant="body" className={cn(selected && "text-[#7c6fda]")}>
                {draft.title}
              </Text>
            </div>
          )}
          <Text
            variant="label"
            color="secondary"
            className={cn(
              "text-pretty leading-relaxed",
              // With no header, the description carries the selected tint.
              hideHeader && selected && "text-[#7c6fda]",
            )}
          >
            {draft.description}
          </Text>
        </button>
      </ChatGradientFrame>
    </motion.div>
  );
}
