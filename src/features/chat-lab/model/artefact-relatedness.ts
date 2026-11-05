import type { ChatLabArtefact, ChatLabArtefactKind } from "./chat-lab-store";
import { matchVisualInterface } from "./visual-interfaces";

const DEIXIS =
  /\b(the|this|that|our)\s+(document|doc|paper|essay|report|memo|search|results?|findings?|board|moodboard|collage|table|rows?|columns?|shot\s*list)\b/i;

const EDIT_VERBS =
  /\b(edit|revise|update|rewrite|expand|shorten|refine|tweak|change|fix|add|remove|insert|delete|replace|polish|redraft|filter|narrow|limit)\b/i;

const FILTER_CUES =
  /\b(filter|narrow|limit|only|just)\b.+\b(to|for|by|in|near|around)\b|\b(those|these|results?|findings?)\b.+\b(filter|narrow|only)\b/i;

const KIND_CUES: Record<ChatLabArtefactKind, RegExp> = {
  document:
    /\b(document|doc|paper|essay|report|memo|section|paragraph|heading|bullet|bold|italic|markdown|title|outline)\b/i,
  search:
    /\b(search|searches|results?|findings?|query|sources?|papers?|filters?|look\s*up)\b/i,
  table:
    /\b(table|rows?|columns?|cells?|shot\s*list|shots?|sort|spreadsheet|tracker)\b/i,
  moodboard:
    /\b(mood\s*board|moodboard|board|collage|palette|tiles?|aesthetic|visuals?)\b/i,
  // A library interface: follow-ups that point at "it" or name what's in it.
  shell: /\b(it|this|that|add|remove|move|change|update)\b/i,
};

/**
 * Whether a new user turn should keep writing into the open interface.
 * Used for both UI focus (dismiss when unpinned) and API tool context.
 */
export function isArtefactRelated(
  text: string,
  artefact: Pick<ChatLabArtefact, "kind" | "title">,
): boolean {
  const draft = text.trim();
  if (!draft) return false;

  if (DEIXIS.test(draft)) return true;
  if (artefact.kind === "search" && FILTER_CUES.test(draft)) return true;
  if (EDIT_VERBS.test(draft) && KIND_CUES[artefact.kind].test(draft)) {
    return true;
  }
  if (artefact.kind === "search" && EDIT_VERBS.test(draft)) return true;
  if (KIND_CUES[artefact.kind].test(draft)) return true;

  const matched = matchVisualInterface(draft);
  if (matched === artefact.kind) return true;

  const title = artefact.title.trim().toLowerCase();
  if (title.length >= 3) {
    const lower = draft.toLowerCase();
    if (lower.includes(title)) return true;
    const words = title.split(/[^a-z0-9]+/).filter((word) => word.length > 3);
    if (words.length > 0 && words.every((word) => lower.includes(word))) {
      return true;
    }
  }

  return false;
}
