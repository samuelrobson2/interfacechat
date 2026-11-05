import { parseBlocks, plainText } from "./markdown-blocks";
import { resultDomain } from "./search-results";
import type {
  SearchResult,
  ShellDataByKind,
  FillableKind,
  TableColumnType,
} from "./shell-types";

/**
 * The parts of a filled-in shell, shared by suggestions (the LLM fills them)
 * and history entries (read off the real content): a title and main text,
 * an optional project tag, and details particular to each interface.
 */
type FillBase = {
  title: string;
  /** Document: the opening paragraph. Table: what a row is. Unused for search. */
  text: string;
  project?: string;
};

export type ShellFillDetails = {
  document: {
    /** Section headings. */
    outline: string[];
    length?: string;
  };
  search: {
    /** Alternate queries the search would actually run. */
    queries: string[];
    filters: string[];
    /** Domains to look at first. */
    sources: string[];
    /** History only: what came back. */
    results?: SearchResult[];
  };
  table: {
    columns: { label: string; type: TableColumnType }[];
    rowCount?: number;
  };
};

export type ShellFill<K extends FillableKind = FillableKind> = FillBase & {
  details: ShellFillDetails[K];
};

export type ShellFillByKind = { [K in FillableKind]: ShellFill<K> };

export function fillToShellData<K extends FillableKind>(
  kind: K,
  fill: ShellFill<K>,
): ShellDataByKind[K] {
  switch (kind) {
    case "document": {
      const { details } = fill as ShellFill<"document">;
      const body = [fill.text.trim(), ...details.outline.map((heading) => `## ${heading}`)]
        .filter(Boolean)
        .join("\n\n");
      return {
        title: fill.title,
        body,
        length: details.length,
        project: fill.project,
      } satisfies ShellDataByKind["document"] as ShellDataByKind[K];
    }
    case "search": {
      const { details } = fill as ShellFill<"search">;
      return {
        query: fill.title,
        queries: details.queries,
        filters: details.filters,
        sources: details.sources,
        results: details.results ?? [],
        project: fill.project,
      } satisfies ShellDataByKind["search"] as ShellDataByKind[K];
    }
    default: {
      const { details } = fill as ShellFill<"table">;
      const table: ShellDataByKind["table"] = {
        title: fill.title,
        description: fill.text,
        columns: details.columns.map((column, index) => ({ id: `col-${index}`, ...column })),
        rows: [],
        rowCount: details.rowCount,
        project: fill.project,
      };
      return table as ShellDataByKind[K];
    }
  }
}

/** Read the parts back off a shell's content (how history entries summarise). */
export function shellFillOf<K extends FillableKind>(
  kind: K,
  data: ShellDataByKind[K],
): ShellFill<K> {
  switch (kind) {
    case "document": {
      const doc = data as ShellDataByKind["document"];
      const blocks = parseBlocks(doc.body);
      const opening = blocks.find((block) => block.type === "paragraph" && block.text.trim());
      return {
        title: doc.title,
        text: opening ? plainText(opening.text) : "",
        project: doc.project,
        details: {
          outline: blocks
            .filter((block) => block.type === "heading1" || block.type === "heading2")
            .map((block) => plainText(block.text)),
          length: doc.length,
        },
      } satisfies ShellFill<"document"> as ShellFill<K>;
    }
    case "search": {
      const search = data as ShellDataByKind["search"];
      const fromResults = search.results
        .map((result) => resultDomain(result.url))
        .filter((domain): domain is string => Boolean(domain));
      return {
        title: search.query,
        text: "",
        project: search.project,
        details: {
          queries: search.queries,
          filters: search.filters,
          sources: search.sources?.length ? search.sources : [...new Set(fromResults)],
          results: search.results.length ? search.results : undefined,
        },
      } satisfies ShellFill<"search"> as ShellFill<K>;
    }
    default: {
      const table = data as ShellDataByKind["table"];
      return {
        title: table.title,
        text: table.description ?? "",
        project: table.project,
        details: {
          columns: table.columns
            .filter((column) => column.label.trim())
            .map(({ label, type }) => ({ label, type })),
          rowCount: table.rows.length || table.rowCount,
        },
      } satisfies ShellFill<"table"> as ShellFill<K>;
    }
  }
}
