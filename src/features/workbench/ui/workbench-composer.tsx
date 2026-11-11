import { motion } from "motion/react";
import { FileIcon } from "@/shared/assets/icons/general/File";
import {
  PromptInput,
  PromptInputActions,
  PromptInputChip,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/shared/compose/prompt-input";
import { cn } from "@/shared/lib/css";
import { ChatComposerTools } from "@/shared/ui/kit-additions";
import { EMPTY_DRAFT, type ComposerDraft } from "../model/composer-draft";

const SPRING = { type: "spring" as const, stiffness: 380, damping: 36 };

/**
 * Chat's input: the shared prompt input, with attach, Connections and
 * Documents at the bottom left. It sits in Chat while Chat is open, and
 * stays on the page, centred, while Chat is minimized: it's how a person
 * talks to every interface. The draft is held by the page, so moving between
 * the two keeps it, and the shared `layoutId` carries the box from one place
 * to the other.
 */
export function WorkbenchComposer({
  draft,
  onDraftChange,
  onSend,
  reducedMotion,
  className,
}: {
  draft: ComposerDraft;
  onDraftChange: (draft: ComposerDraft) => void;
  onSend: (text: string) => void;
  reducedMotion: boolean;
  className?: string;
}) {
  const canSend = Boolean(draft.text.trim());
  const send = () => {
    const text = draft.text.trim();
    if (!text) return;
    onSend(draft.attached.length ? `${text}\n\nAttached: ${draft.attached.join(", ")}` : text);
    onDraftChange(EMPTY_DRAFT);
  };

  return (
    <motion.div
      layoutId="workbench-composer"
      transition={reducedMotion ? { duration: 0 } : SPRING}
      data-highlight-skip
      className={cn("w-full", className)}
    >
      <PromptInput className="max-h-[212px] min-h-[106px] md:max-h-[200px] md:min-h-[100px]">
        <PromptInputTextarea
          value={draft.text}
          onChange={(event) => onDraftChange({ ...draft, text: event.target.value })}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              send();
            }
          }}
          placeholder="How can we help you?"
        />
        <PromptInputFooter>
          <PromptInputActions className="min-w-0 gap-1">
            <ChatComposerTools
              onAttach={(files) =>
                onDraftChange({ ...draft, attached: [...draft.attached, ...files.map((file) => file.name)] })
              }
            />
            {draft.attached.map((name, index) => (
              <PromptInputChip
                key={`${name}-${index}`}
                icon={<FileIcon svgClasses="size-4 shrink-0" />}
                label={name}
                onRemove={() =>
                  onDraftChange({ ...draft, attached: draft.attached.filter((_, i) => i !== index) })
                }
              />
            ))}
          </PromptInputActions>
          <PromptInputActions>
            <PromptInputSubmit active={canSend} disabled={!canSend} onClick={send} />
          </PromptInputActions>
        </PromptInputFooter>
      </PromptInput>
    </motion.div>
  );
}
