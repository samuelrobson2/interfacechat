import {
  SHELL_META,
  SHELL_ROUTE_FLOOR,
  shellKindScore,
  shellScoreBreakdown,
  type ChatShellKind,
} from "@/features/interface-shells";
import {
  emptyKindData,
  tileText,
  type HomeTile,
  type KindData,
} from "./home-tiles";

/** A blank leader at or above this grows; below it, it only hints. */
export const HINT_FLOOR = SHELL_ROUTE_FLOOR;
/** Past work needs this much shared content before it takes the middle. */
export const SIMILAR_LEVEL = 28;
/** A leader only leaves once its score falls this low. */
export const DROP_LEVEL = 6;
/** A challenger this far ahead replaces the leader at once. */
export const CLEAR_LEAD = 24;
/** Otherwise it has to win this many keystrokes in a row. */
export const CHALLENGER_WINS = 2;

const CONTENT_HIT = 14;

export type HomeLeaderPhase = "hinted" | "suggested" | "chosen";

/** The one interface filling the middle of the home. */
export type HomeLeader = {
  /** The tile this leader came from. */
  tileId: string;
  phase: HomeLeaderPhase;
  /** What the middle card shows. A blank leader starts empty and fills from the draft. */
  interface: KindData;
  /** Past work: the chat that sending or clicking reopens. */
  sessionId?: string;
  /** Past work from a project: the project tile shown beside the middle card. */
  companionId?: string;
};

export type RankedTile = { tile: HomeTile; score: number };

export type HomeRankingMemory = {
  leaderId: string | null;
  challengerId: string | null;
  challengerWins: number;
};

export type HomeRanking = {
  leader: HomeLeader | null;
  /** Every tile not in the middle, most relevant first. A project companion comes first. */
  order: RankedTile[];
  memory: HomeRankingMemory;
};

export type RankHomeInput = {
  tiles: HomeTile[];
  draft: string;
  /** A tile the person clicked, Tabbed into, or edited. It holds the middle. */
  chosenTileId?: string | null;
  /** Esc or ×: the field still reorders, but nothing fills. */
  dismissed?: boolean;
  previous?: HomeRankingMemory | null;
};

export const EMPTY_MEMORY: HomeRankingMemory = {
  leaderId: null,
  challengerId: null,
  challengerWins: 0,
};

const STOPWORDS = new Set(
  (
    "the and for with about from into that this those these their them they you your our " +
    "can could would should please help want need like make build create write draft compose " +
    "search find look plan give get let some any all each per one two three day days new " +
    "paper papers document table list report"
  ).split(" "),
);

/** Distinctive words in a text, lightly stemmed so "shoots" meets "shoot". */
export function contentTerms(text: string): Set<string> {
  const terms = new Set<string>();
  for (const raw of text.toLowerCase().split(/[^a-z0-9]+/)) {
    if (raw.length < 3 || STOPWORDS.has(raw)) continue;
    terms.add(
      raw.length > 3 && raw.endsWith("s") && !raw.endsWith("ss")
        ? raw.slice(0, -1)
        : raw,
    );
  }
  return terms;
}

function contentScore(draftTerms: Set<string>, tile: HomeTile) {
  if (draftTerms.size === 0) return 0;
  let hits = 0;
  for (const term of contentTerms(tileText(tile)))
    if (draftTerms.has(term)) hits += 1;
  return hits * CONTENT_HIT;
}

type Scored = RankedTile & { kindScore: number; contentScore: number };

function scoreTile(
  tile: HomeTile,
  draft: string,
  draftTerms: Set<string>,
): Scored {
  const kindScore =
    tile.type === "project" ? 0 : shellKindScore(tile.kind, draft);
  const content = tile.type === "blank" ? 0 : contentScore(draftTerms, tile);
  const score =
    tile.type === "blank"
      ? kindScore
      : tile.type === "suggested"
        ? content + kindScore / 2
        : tile.type === "history"
          ? content + kindScore / 4
          : content;
  return { tile, score, kindScore, contentScore: content };
}

/** How strongly a tile claims the middle: interface fit for blanks, shared content for past work. */
function leaderStrength(entry: Scored) {
  if (entry.tile.type === "blank") return entry.kindScore;
  if (entry.tile.type === "history" || entry.tile.type === "project")
    return entry.contentScore;
  return 0;
}

function qualifies(entry: Scored, level: "hold" | "enter") {
  const strength = leaderStrength(entry);
  if (entry.tile.type === "blank")
    return strength >= (level === "enter" ? HINT_FLOOR : DROP_LEVEL);
  if (entry.tile.type === "history" || entry.tile.type === "project") {
    return (
      strength >=
      (level === "enter" ? SIMILAR_LEVEL : SIMILAR_LEVEL - CONTENT_HIT)
    );
  }
  return false;
}

function leaderFrom(tile: HomeTile, phase: HomeLeaderPhase): HomeLeader {
  switch (tile.type) {
    case "blank":
      return { tileId: tile.id, phase, interface: emptyKindData(tile.kind) };
    case "suggested":
      return {
        tileId: tile.id,
        phase,
        interface: { kind: tile.kind, data: tile.data } as KindData,
      };
    case "history":
      return {
        tileId: tile.id,
        phase,
        interface: { kind: tile.kind, data: tile.data } as KindData,
        sessionId: tile.sessionId,
      };
    case "project": {
      const [first] = tile.interfaces;
      return {
        tileId: tile.id,
        phase,
        interface: { kind: first!.kind, data: first!.data } as KindData,
        sessionId: tile.sessionId,
        companionId: tile.id,
      };
    }
  }
}

/** Two distinctive words beyond the ones that named the interface: enough to fill a card. */
export const DETAIL_TERMS = 2;

/** Words in the draft that say what it's about, not which interface it wants. */
export function detailTerms(draft: string, kind: ChatShellKind) {
  const naming = new Set<string>();
  // Only the words that named the interface in this draft: "week" is detail in
  // "a schedule for the launch week", even though "plan my week" is a trigger.
  for (const phrase of [...shellScoreBreakdown(kind, draft).matchedTriggers, SHELL_META[kind].label])
    for (const term of contentTerms(phrase)) naming.add(term);
  return [...contentTerms(draft)].filter((term) => !naming.has(term));
}

/**
 * Recognised but bare ("Write a paper") is a hint at medium; once the draft
 * says what it's about ("…on coral reefs") the card grows to medium plus and
 * fills. Past work is already full, so it comes in grown.
 */
function phaseOf(entry: Scored, draft: string): HomeLeaderPhase {
  if (entry.tile.type !== "blank") return "suggested";
  return detailTerms(draft, entry.tile.kind).length >= DETAIL_TERMS ? "suggested" : "hinted";
}

/** The best claim on the middle this keystroke, before stickiness. Past work wins ties. */
function bestCandidate(scored: Scored[]): Scored | null {
  let best: Scored | null = null;
  for (const entry of scored) {
    if (!qualifies(entry, "enter")) continue;
    const strength = leaderStrength(entry);
    const bestStrength = best ? leaderStrength(best) : -1;
    const pastBeatsBlank =
      best?.tile.type === "blank" && entry.tile.type !== "blank";
    if (
      strength > bestStrength ||
      (strength === bestStrength && pastBeatsBlank)
    )
      best = entry;
  }
  return best;
}

/** Resting order on an empty draft: suggestions, then blanks, then the most recent past work. */
const REST_ORDER: Record<HomeTile["type"], number> = {
  suggested: 0,
  blank: 1,
  project: 2,
  history: 2,
};

const recency = (tile: HomeTile) =>
  tile.type === "history" || tile.type === "project" ? tile.updatedAt : 0;

function byRelevance(a: Scored, b: Scored) {
  return (
    b.score - a.score ||
    REST_ORDER[a.tile.type] - REST_ORDER[b.tile.type] ||
    recency(b.tile) - recency(a.tile)
  );
}

/**
 * Rank every tile on the home for the current draft and pick the one interface
 * that fills the middle. Pure: pass the previous memory back in on the next
 * keystroke so the leader doesn't flicker.
 */
export function rankHome({
  tiles,
  draft,
  chosenTileId = null,
  dismissed = false,
  previous = null,
}: RankHomeInput): HomeRanking {
  const draftTerms = contentTerms(draft);
  const scored = tiles
    .map((tile) => scoreTile(tile, draft, draftTerms))
    .sort(byRelevance);
  const byId = new Map(scored.map((entry) => [entry.tile.id, entry]));

  let leaderEntry: Scored | null = null;
  let phase: HomeLeaderPhase = "hinted";
  let memory: HomeRankingMemory = EMPTY_MEMORY;

  const chosen = chosenTileId ? byId.get(chosenTileId) : undefined;
  if (chosen) {
    leaderEntry = chosen;
    phase = "chosen";
    memory = {
      leaderId: chosen.tile.id,
      challengerId: null,
      challengerWins: 0,
    };
  } else if (!dismissed && draft.trim()) {
    const candidate = bestCandidate(scored);
    const held = previous?.leaderId ? byId.get(previous.leaderId) : undefined;
    const holding = held && qualifies(held, "hold") ? held : undefined;

    const challenges =
      holding &&
      candidate &&
      candidate.tile.id !== holding.tile.id &&
      leaderStrength(candidate) > leaderStrength(holding);

    if (!holding || !candidate || !challenges) {
      leaderEntry = holding ?? candidate;
      memory = {
        leaderId: leaderEntry?.tile.id ?? null,
        challengerId: null,
        challengerWins: 0,
      };
    } else {
      const wins =
        previous?.challengerId === candidate.tile.id
          ? previous.challengerWins + 1
          : 1;
      const clearlyAhead =
        leaderStrength(candidate) - leaderStrength(holding) >= CLEAR_LEAD;
      if (clearlyAhead || wins >= CHALLENGER_WINS) {
        leaderEntry = candidate;
        memory = {
          leaderId: candidate.tile.id,
          challengerId: null,
          challengerWins: 0,
        };
      } else {
        leaderEntry = holding;
        memory = {
          leaderId: holding.tile.id,
          challengerId: candidate.tile.id,
          challengerWins: wins,
        };
      }
    }
    if (leaderEntry) phase = phaseOf(leaderEntry, draft);
  }

  const leader = leaderEntry ? leaderFrom(leaderEntry.tile, phase) : null;
  const companion = leader?.companionId
    ? byId.get(leader.companionId)
    : undefined;
  const order = scored
    .filter((entry) => entry.tile.id !== leader?.tileId)
    .map(({ tile, score }) => ({ tile, score }));
  if (companion)
    order.unshift({ tile: companion.tile, score: companion.score });

  return { leader, order, memory };
}
