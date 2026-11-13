import { useMemo, useState } from "react";
import { SHELL_META, type ShellDataByKind, type ChatShellKind } from "@/features/interface-shells";
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
import { applyCardEdit, parsePrompt, reframePrompt } from "./prompt-fields";

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
  | { type: "interface"; text: string; interface: KindData }
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
  const chosenTileId =
    chosen && rewrittenShare(chosen.anchor, draft) <= RELEASE_RATIO
      ? chosen.tileId
      : null;

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
  const card: HomeCard | null = useMemo(() => {
    if (!leader || !tile) return null;
    if (tile.type === "history" || tile.type === "project") {
      return { leader, interface: leader.interface, editable: false };
    }
    const kind = leader.interface.kind;
    const parsed = parsePrompt(kind, draft).data;
    const base =
      tile.type === "suggested" ? overlay(tile.data, parsed) : parsed;
    const kept = extras?.tileId === tile.id ? extras.data : {};
    return {
      leader,
      interface: { kind, data: { ...base, ...kept } } as KindData,
      editable: leader.phase !== "hinted",
    };
  }, [leader, tile, draft, extras]);

  // The few choices the request leaves open, for the card that's open (Document, for now).
  const choiceKind = card?.editable ? card.interface.kind : null;
  const choices = usePromptChoices(choiceKind, choiceKind ? SHELL_META[choiceKind].label : "", draft);

  const choose = (tileId: string, nextDraft: string) => {
    setDismissed(false);
    setChosen({ tileId, anchor: nextDraft });
  };

  return {
    tiles,
    draft,
    ranking,
    card,
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
    /** What the open card's request leaves open: at most three, each with options and a guess. */
    choices: choices.shown,
    choicesThinking: choices.thinking,
    /** Settle a choice: its phrase goes into the prompt, in the one sentence the choices write. */
    pickChoice(key: string, labels: string[]) {
      const next = choices.pick(key, labels, draft);
      if (next !== draft) setDraft(next);
      if (card) choose(card.leader.tileId, next);
    },
    /** Grow a hinted card and lock it, as Tab does. */
    promote() {
      if (leader) choose(leader.tileId, draft);
    },
    dismiss() {
      setChosen(null);
      setDismissed(true);
    },
    /** An edit on the middle card: rewrite the prompt, keep what it can't hold. */
    edit(next: KindData) {
      if (!card || !card.editable || next.kind !== card.interface.kind) return;
      const result = applyCardEdit(
        next.kind,
        draft,
        card.interface.data,
        next.data,
      );
      const tileId = card.leader.tileId;
      setExtras((current) => ({
        tileId,
        data: {
          ...(current?.tileId === tileId ? current.data : {}),
          ...result.extras,
        },
      }));
      if (result.prompt !== draft) setDraft(result.prompt);
      choose(tileId, result.prompt);
    },
    /** What sending the draft should do right now. */
    submission(text = draft): HomeSubmit {
      if (!card || card.leader.phase === "hinted")
        return { type: "chat", text };
      if (card.leader.sessionId) {
        return { type: "continue", text, sessionId: card.leader.sessionId };
      }
      return { type: "interface", text, interface: card.interface };
    },
  };
}

export type HomeField = ReturnType<typeof useHomeField>;
