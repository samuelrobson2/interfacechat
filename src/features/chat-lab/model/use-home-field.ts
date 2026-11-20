import { useMemo, useState } from "react";
import { mentionedKind, SHELL_META, withoutMentions, type ShellDataByKind, type ChatShellKind, type SuggestedGroup, type SuggestedValues } from "@/features/interface-shells";
import { useChatLabStore } from "./chat-lab-store";
import {
  EMPTY_MEMORY,
  rankHome,
  type HomeLeader,
  type HomeRanking,
  type HomeRankingMemory,
} from "./home-ranking";
import { collectHomeTiles, libraryTiles, type HomeTile, type KindData } from "./home-tiles";
import { usePromptChoices } from "./prompt-choices";
import { useInterfaceName } from "./interface-name";
import { parsePrompt, reframePrompt } from "./prompt-fields";
import { sendCard, withPickedLines } from "./home-send";

/** A chosen tile holds the middle until most of what was typed when it was chosen is gone. */
const RELEASE_RATIO = 0.3;

/** How much of `before` was removed or replaced to get `after`; appending costs nothing. */
export function rewrittenShare(before: string, after: string) {
  if (!before) return 0;
  let prefix = 0;
  while (prefix < before.length && before[prefix] === after[prefix])
    prefix += 1;
  let suffix = 0;
  while (
    suffix < before.length - prefix &&
    before[before.length - 1 - suffix] === after[after.length - 1 - suffix]
  ) {
    suffix += 1;
  }
  return (before.length - prefix - suffix) / before.length;
}

const sameMemory = (a: HomeRankingMemory, b: HomeRankingMemory) =>
  a.leaderId === b.leaderId &&
  a.challengerId === b.challengerId &&
  a.challengerWins === b.challengerWins;

/** What the card's fillable parts hold now, by group: a table's named columns, a search's filters, a checklist's items. */
function partsOf(value: KindData | undefined): Partial<Record<SuggestedGroup, string[]>> {
  if (!value) return {};
  const data = value.data as {
    columns?: { label: string }[];
    filters?: string[];
    items?: { label: string }[];
    constraints?: string[];
    length?: string;
    facts?: { label: string; value: string }[];
  };
  if (value.kind === "table") return { columns: (data.columns ?? []).map((column) => column.label).filter(Boolean) };
  if (value.kind === "search") return { filters: data.filters ?? [] };
  if (value.kind === "tracker") return { items: (data.items ?? []).map((item) => item.label) };
  if (value.kind === "schedule") return { constraints: data.constraints ?? [] };
  if (value.kind === "document") return data.length ? { lengths: [data.length] } : {};
  if (value.kind === "guide") {
    // What the request already says needs no guess.
    const fact = (label: string) => data.facts?.find((f) => f.label.toLowerCase() === label)?.value;
    return { ...(fact("serves") ? { serves: [fact("serves")!] } : {}), ...(fact("time") ? { time: [fact("time")!] } : {}) };
  }
  return {};
}

/** Parsed fields win where they have a value; the tile's own content fills the rest. */
function overlay<K extends ChatShellKind>(
  base: ShellDataByKind[K],
  parsed: ShellDataByKind[K],
) {
  const out: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(parsed)) {
    const empty =
      value === undefined ||
      value === "" ||
      (Array.isArray(value) && value.length === 0);
    if (!empty) out[key] = value;
  }
  return out as ShellDataByKind[K];
}

export type HomeCard = {
  leader: HomeLeader;
  /** What the middle card shows. */
  interface: KindData;
  /** Past work is shown as it was; only new interfaces are edited here. */
  editable: boolean;
};

export type HomeSubmit =
  | { type: "chat"; text: string }
  | { type: "interface"; text: string; interface: KindData; brief?: string }
  | { type: "continue"; text: string; sessionId: string };

/**
 * Everything the chat home knows between keystrokes: what's chosen or
 * dismissed, edits the prompt can't hold, and the ranking's memory.
 */
export function useHomeField(draft: string, setDraft: (text: string) => void) {
  const sessions = useChatLabStore((state) => state.sessions);
  const tiles = useMemo(
    // Just the interfaces for now: no suggestions or past work on the field.
    () => collectHomeTiles({ sessions: Object.values(sessions) }, [libraryTiles]),
    [sessions],
  );

  const [chosen, setChosen] = useState<{
    tileId: string;
    anchor: string;
  } | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [extras, setExtras] = useState<{
    tileId: string;
    data: Record<string, unknown>;
  } | null>(null);

  // Clearing the draft starts over.
  if (!draft.trim() && (chosen || dismissed || extras)) {
    setChosen(null);
    setDismissed(false);
    setExtras(null);
  }
  // "@Table" in the request picks the Table's card, whatever the words would rank; the card reads the rest.
  const mentioned = mentionedKind(draft);
  const asked = mentioned ? withoutMentions(draft) : draft;
  const mentionTile = mentioned ? tiles.find((item) => item.type === "blank" && item.kind === mentioned) : undefined;
  const chosenTileId =
    mentionTile?.id ??
    (chosen && rewrittenShare(chosen.anchor, draft) <= RELEASE_RATIO
      ? chosen.tileId
      : null);

  // Memory advances once per draft, however many times this renders.
  const [track, setTrack] = useState<{
    draft: string;
    input: HomeRankingMemory | null;
    output: HomeRankingMemory;
  }>({ draft: "", input: null, output: EMPTY_MEMORY });
  const previous = track.draft === draft ? track.input : track.output;
  const ranking: HomeRanking = useMemo(
    () => rankHome({ tiles, draft, chosenTileId, dismissed, previous }),
    [tiles, draft, chosenTileId, dismissed, previous],
  );
  if (track.draft !== draft || !sameMemory(track.output, ranking.memory)) {
    setTrack({ draft, input: previous, output: ranking.memory });
  }

  const leader = ranking.leader;
  const tile = leader
    ? tiles.find((item) => item.id === leader.tileId)
    : undefined;
  // The name comes from the request at once; the model only condenses a very long one, and writes a Guide's or Schedule's first steps.
  const nameKind = leader && tile && tile.type !== "history" && tile.type !== "project" ? leader.interface.kind : null;
  const ruleTitle = useMemo(() => (nameKind ? String((parsePrompt(nameKind, asked).data as { title?: unknown }).title ?? "") : ""), [nameKind, asked]);
  const name = useInterfaceName(nameKind, nameKind ? SHELL_META[nameKind].label : "", asked, ruleTitle);

  const card: HomeCard | null = useMemo(() => {
    if (!leader || !tile) return null;
    if (tile.type === "history" || tile.type === "project") {
      return { leader, interface: leader.interface, editable: false };
    }
    const kind = leader.interface.kind;
    const parsed = parsePrompt(kind, asked).data;
    const base =
      tile.type === "suggested" ? overlay(tile.data, parsed) : parsed;
    const kept = extras?.tileId === tile.id ? extras.data : {};
    // The model's condensed name (only for a very long one), unless they've named it themselves on the card.
    const named = name.title && !("title" in kept) && "title" in base ? { title: name.title } : {};
    return {
      leader,
      interface: { kind, data: { ...base, ...named, ...kept } } as KindData,
      // Every recognised card is open to edit: it goes to medium plus as soon as it's detected.
      editable: true,
    };
  }, [leader, tile, asked, extras, name.title]);

  // The few choices the request leaves open, for the card that's open (Document, for now).
  const choiceKind = card?.editable ? card.interface.kind : null;
  const choices = usePromptChoices(choiceKind, choiceKind ? SHELL_META[choiceKind].label : "", asked, partsOf(card?.interface));
  // Notes holds what's been settled: a choice picked on its card becomes a line in it.
  const shownCard = card && card.interface.kind === "notes" ? withPickedLines(card, choices.picked) : card;

  const suggested: SuggestedValues = name.steps.length
    ? { ...choices.suggested, ...(card?.interface.kind === "schedule" ? { tasks: name.steps } : {}) }
    : choices.suggested;

  const choose = (tileId: string, nextDraft: string) => {
    setDismissed(false);
    setChosen({ tileId, anchor: nextDraft });
  };

  return {
    tiles,
    draft,
    ranking,
    card: shownCard,
    dismissed,
    /** Click a tile on the field. Past work returns its chat id to reopen. */
    pick(picked: HomeTile): { reopen: string } | null {
      if (picked.type === "history" || picked.type === "project") {
        return { reopen: picked.sessionId };
      }
      const nextDraft =
        picked.type === "suggested"
          ? picked.prompt
          : reframePrompt(draft, picked.kind);
      setDraft(nextDraft);
      if (extras?.tileId !== picked.id) setExtras(null);
      choose(picked.id, nextDraft);
      return null;
    },
    /** Take a suggested request for a tile (a peek on the home): it becomes the prompt, and that tile's card opens with it. */
    tryPrompt(picked: HomeTile, prompt: string) {
      setDraft(prompt);
      if (extras?.tileId !== picked.id) setExtras(null);
      choose(picked.id, prompt);
    },
    /** What the open card's request leaves open: at most three, each with options and a guess. */
    choices: choices.shown,
    /** The choices answered so far: shown small on the card as their answers, and open to change. */
    answered: choices.picked,
    choicesThinking: choices.thinking,
    /** Values for the card's own parts, shown in place: columns, filters, items; and the first steps as they arrive. */
    suggested,
    dismissSuggestion: choices.dismiss,
    /** Pick or unpick a choice. The prompt stays as they wrote it; the picks go with the interface. */
    pickChoice(key: string, labels: string[], own?: string) {
      choices.pick(key, labels, own);
      if (card) choose(card.leader.tileId, draft);
    },
    /** Answer a choice "No preference". */
    skipChoice(key: string) {
      choices.skip(key);
      if (card) choose(card.leader.tileId, draft);
    },
    /** Grow a hinted card and lock it, as Tab does. */
    promote() {
      if (leader) choose(leader.tileId, draft);
    },
    dismiss() {
      setChosen(null);
      setDismissed(true);
    },
    /**
     * An edit on the middle card. Their prompt is left exactly as they typed it:
     * what they changed on the card stays on the card, and wins over what the
     * prompt says, and goes with the interface when it's sent.
     */
    edit(next: KindData) {
      if (!card || !card.editable || next.kind !== card.interface.kind) return;
      const before = card.interface.data as Record<string, unknown>;
      const after = next.data as Record<string, unknown>;
      const changed = Object.fromEntries(Object.entries(after).filter(([key, value]) => value !== before[key]));
      const tileId = card.leader.tileId;
      setExtras((current) => ({
        tileId,
        data: { ...(current?.tileId === tileId ? current.data : {}), ...changed },
      }));
      choose(tileId, draft);
    },
    /** What sending the draft should do right now. */
    submission(text = draft): HomeSubmit {
      if (!card) return { type: "chat", text };
      if (card.leader.sessionId) {
        return { type: "continue", text, sessionId: card.leader.sessionId };
      }
      // The interface goes as they see it on the card, with their words as typed: every choice, picked or not, and every value it shows.
      return { type: "interface", text, ...sendCard(card, [...choices.picked, ...choices.shown], suggested) };
    },
  };
}

export type HomeField = ReturnType<typeof useHomeField>;
