import { openai } from "@ai-sdk/openai";
import { cosineSimilarity, embed, embedMany } from "ai";

/**
 * Hybrid retrieval of interfaces for a chat turn: the app's keyword ranking
 * merged with a ranking by meaning (the request's embedding against each
 * interface's), so a request that says what it wants in other words still
 * finds it ("plan out the day" → Schedule, "what should we cook" → Guide).
 *
 * - Each interface's meaning is embedded once and kept for the life of the
 *   server; each turn embeds only the request.
 * - The two rankings are merged by reciprocal rank fusion: an interface high
 *   in either list ranks high, and high in both ranks highest.
 * - Small talk ("thanks!") finds nothing: with no keyword evidence, a match by
 *   meaning has to be strong to count.
 * - If embedding fails, the keyword ranking stands alone.
 */

type Candidate = { id: string; label: string; description: string; opensAs: string; layer?: "interface" | "format" };
export type RetrievalInput = {
  query: string;
  catalogue: (Candidate & { meaning: string })[];
  keyword: { id: string; score: number }[];
};

const MODEL = "text-embedding-3-small";
/** Reciprocal rank fusion's constant: how much a lower rank still counts. */
const RRF_K = 60;
/** A match by meaning counts from here (cosine similarity, this model). */
const MEANING_FLOOR = 0.3;
/** With no keyword evidence at all, the best match by meaning has to reach this. */
const MEANING_ALONE = 0.4;
/** How many by meaning join the merge. */
const MEANING_TOP = 6;
/** When meaning finds a clear match, a keyword-only hit this far below it in meaning is noise, and drops out. */
const NOISE_GAP = 0.2;

const meanings = new Map<string, number[]>();

async function embedMeanings(texts: string[]) {
  const missing = [...new Set(texts.filter((text) => !meanings.has(text)))];
  if (!missing.length) return;
  const { embeddings } = await embedMany({ model: openai.embedding(MODEL), values: missing });
  missing.forEach((text, index) => meanings.set(text, embeddings[index]!));
}

export async function hybridCandidates(input: RetrievalInput, limit = 5): Promise<{ candidates: Candidate[]; trace: string }> {
  const byId = new Map(input.catalogue.map((entry) => [entry.id, entry]));
  const strip = (entry: Candidate & { meaning: string }): Candidate => ({ id: entry.id, label: entry.label, description: entry.description, opensAs: entry.opensAs, ...(entry.layer ? { layer: entry.layer } : {}) });
  const keywordOnly = () => input.keyword.slice(0, limit).flatMap((entry) => (byId.has(entry.id) ? [strip(byId.get(entry.id)!)] : []));
  if (!input.query.trim()) return { candidates: [], trace: "empty" };

  let ranked: { id: string; similarity: number }[];
  try {
    await embedMeanings(input.catalogue.map((entry) => entry.meaning));
    const { embedding } = await embed({ model: openai.embedding(MODEL), value: input.query });
    ranked = input.catalogue
      .map((entry) => ({ id: entry.id, similarity: cosineSimilarity(embedding, meanings.get(entry.meaning)!) }))
      .sort((a, b) => b.similarity - a.similarity);
  } catch (error) {
    return { candidates: keywordOnly(), trace: `keyword only (${error instanceof Error ? error.message : error})` };
  }

  const best = ranked[0]?.similarity ?? 0;
  const semantic = input.keyword.length || best >= MEANING_ALONE ? ranked.filter((entry) => entry.similarity >= MEANING_FLOOR).slice(0, MEANING_TOP) : [];
  const similarity = new Map(ranked.map((entry) => [entry.id, entry.similarity]));
  // Keyword hits that meaning says are unrelated ("names for the brand" matching Flowchart) drop out once meaning has a clear match.
  const keyword = best >= MEANING_ALONE ? input.keyword.filter((entry) => (similarity.get(entry.id) ?? 0) >= best - NOISE_GAP) : input.keyword;
  const fused = new Map<string, number>();
  keyword.forEach((entry, rank) => fused.set(entry.id, (fused.get(entry.id) ?? 0) + 1 / (RRF_K + rank)));
  semantic.forEach((entry, rank) => fused.set(entry.id, (fused.get(entry.id) ?? 0) + 1 / (RRF_K + rank)));
  const candidates = [...fused.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .flatMap(([id]) => (byId.has(id) ? [strip(byId.get(id)!)] : []));
  const trace = `keyword [${input.keyword.slice(0, 5).map((entry) => `${entry.id} ${(similarity.get(entry.id) ?? 0).toFixed(2)}`).join(", ")}] · meaning [${semantic.slice(0, 4).map((entry) => `${entry.id} ${entry.similarity.toFixed(2)}`).join(", ")}] → [${candidates.map((entry) => entry.id).join(", ")}]`;
  return { candidates, trace };
}
