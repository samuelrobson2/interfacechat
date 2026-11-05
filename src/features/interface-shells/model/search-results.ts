import { plainText } from "./markdown-blocks";
import type { SearchResult } from "./shell-types";

const LINK = /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/;
const BARE_URL = /\((https?:\/\/[^)\s]+)\)|<(https?:\/\/[^>\s]+)>|(https?:\/\/\S+)/;
const BOLD_LEAD = /^\*\*([^*]+)\*\*\s*[—–:-]?\s*/;
const SEPARATOR = /\s+[—–]\s+|\s+-\s+|:\s+/;

export function resultDomain(url?: string) {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

/** One finding per markdown bullet: "[Title](url) — snippet" or "**Title** — snippet". */
export function parseSearchResults(markdown: string): SearchResult[] {
  return markdown
    .split("\n")
    .map((line) => line.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, "").trim())
    .filter(Boolean)
    .map((line, index) => {
      let rest = line;
      let title = "";
      let url: string | undefined;

      const link = rest.match(LINK);
      if (link && (link.index ?? 0) < 4) {
        title = link[1] ?? "";
        url = link[2];
        rest = rest.slice((link.index ?? 0) + link[0].length);
      } else {
        const bold = rest.match(BOLD_LEAD);
        if (bold) {
          title = bold[1] ?? "";
          rest = rest.slice(bold[0].length);
        }
      }

      if (!url) {
        const bare = rest.match(LINK) ?? rest.match(BARE_URL);
        if (bare) {
          url = bare[2] ?? bare[1] ?? bare[3];
          rest = rest.replace(bare[0], "").trim();
        }
      }

      rest = rest.replace(/^\s*[—–:-]\s*/, "").trim();
      if (!title) {
        const [lead, ...others] = rest.split(SEPARATOR);
        if (lead !== undefined && others.length > 0 && lead.length <= 90) {
          title = lead;
          rest = rest.slice(lead.length).replace(SEPARATOR, "").trim();
        } else {
          title = rest;
          rest = "";
        }
      }

      return {
        id: `result-${index}`,
        title: plainText(title).trim(),
        snippet: plainText(rest).replace(/\s*\(\s*\)\s*$/, "").trim(),
        url,
      };
    });
}

export function serializeSearchResults(results: SearchResult[]) {
  return results
    .map((result) => {
      const head = result.url ? `[${result.title}](${result.url})` : `**${result.title}**`;
      return result.snippet ? `- ${head} — ${result.snippet}` : `- ${head}`;
    })
    .join("\n");
}
