import { shellId } from "./shell-types";

export type BlockType =
  | "paragraph"
  | "heading1"
  | "heading2"
  | "bullet"
  | "numbered"
  | "quote";

export type DocBlock = { id: string; type: BlockType; text: string };

const LIST_TYPES: BlockType[] = ["bullet", "numbered"];

/** Markdown line prefixes that turn a block into another type as you type. */
const SHORTCUTS: { pattern: RegExp; type: BlockType }[] = [
  { pattern: /^#\s/, type: "heading1" },
  { pattern: /^#{2,6}\s/, type: "heading2" },
  { pattern: /^[-*•]\s/, type: "bullet" },
  { pattern: /^\d+[.)]\s/, type: "numbered" },
  { pattern: /^>\s?/, type: "quote" },
];

export function newBlock(type: BlockType = "paragraph", text = ""): DocBlock {
  return { id: shellId("block"), type, text };
}

/** A typed prefix ("## ", "- ", "1. ") converts the block and is consumed. */
export function applyShortcut(block: DocBlock): DocBlock {
  if (block.type !== "paragraph") return block;
  for (const { pattern, type } of SHORTCUTS) {
    const match = block.text.match(pattern);
    if (match) return { ...block, type, text: block.text.slice(match[0].length) };
  }
  return block;
}

export function parseBlocks(markdown: string): DocBlock[] {
  const blocks: DocBlock[] = [];
  let paragraph: string[] = [];

  const flush = () => {
    if (paragraph.length === 0) return;
    blocks.push(newBlock("paragraph", paragraph.join(" ")));
    paragraph = [];
  };

  for (const rawLine of markdown.split("\n")) {
    const line = rawLine.trimEnd();
    if (!line.trim()) {
      flush();
      continue;
    }
    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      flush();
      blocks.push(
        newBlock(heading[1]?.length === 1 ? "heading1" : "heading2", heading[2]),
      );
      continue;
    }
    const bullet = line.match(/^\s*[-*•]\s+(.*)$/);
    if (bullet) {
      flush();
      blocks.push(newBlock("bullet", bullet[1]));
      continue;
    }
    const numbered = line.match(/^\s*\d+[.)]\s+(.*)$/);
    if (numbered) {
      flush();
      blocks.push(newBlock("numbered", numbered[1]));
      continue;
    }
    const quote = line.match(/^>\s?(.*)$/);
    if (quote) {
      flush();
      blocks.push(newBlock("quote", quote[1]));
      continue;
    }
    paragraph.push(line.trim());
  }
  flush();

  return blocks.length > 0 ? blocks : [newBlock()];
}

function blockToMarkdown(block: DocBlock, index: number) {
  switch (block.type) {
    case "heading1":
      return `# ${block.text}`;
    case "heading2":
      return `## ${block.text}`;
    case "bullet":
      return `- ${block.text}`;
    case "numbered":
      return `${index}. ${block.text}`;
    case "quote":
      return `> ${block.text}`;
    default:
      return block.text;
  }
}

export function serializeBlocks(blocks: DocBlock[]): string {
  const lines: string[] = [];
  let numberedIndex = 0;
  blocks.forEach((block, i) => {
    const previous = blocks[i - 1];
    numberedIndex = block.type === "numbered" ? numberedIndex + 1 : 0;
    const sameList =
      previous &&
      LIST_TYPES.includes(block.type) &&
      previous.type === block.type;
    if (i > 0) lines.push(sameList ? "\n" : "\n\n");
    lines.push(blockToMarkdown(block, numberedIndex));
  });
  const markdown = lines.join("");
  return markdown.trim() ? markdown : "";
}

/** Position of each numbered block within its run (1-based). */
export function numberedIndices(blocks: DocBlock[]): Map<string, number> {
  const indices = new Map<string, number>();
  let run = 0;
  for (const block of blocks) {
    run = block.type === "numbered" ? run + 1 : 0;
    if (run) indices.set(block.id, run);
  }
  return indices;
}

export type InlineSegment = {
  text: string;
  /** Index of this segment's first character in the raw markdown. */
  rawStart: number;
  bold?: boolean;
  italic?: boolean;
  code?: boolean;
  strike?: boolean;
  href?: string;
};

const INLINE =
  /\*\*([^*]+)\*\*|\*([^*]+)\*|_([^_]+)_|`([^`]+)`|\[([^\]]+)\]\(([^)\s]+)\)|~~([^~]+)~~/g;

export function parseInline(raw: string): InlineSegment[] {
  const segments: InlineSegment[] = [];
  let cursor = 0;
  for (const match of raw.matchAll(INLINE)) {
    const index = match.index ?? 0;
    if (index > cursor) {
      segments.push({ text: raw.slice(cursor, index), rawStart: cursor });
    }
    const [, bold, italicStar, italicUnderscore, code, linkText, href, strike] = match;
    if (bold !== undefined) {
      segments.push({ text: bold, rawStart: index + 2, bold: true });
    } else if (italicStar !== undefined || italicUnderscore !== undefined) {
      segments.push({
        text: italicStar ?? italicUnderscore ?? "",
        rawStart: index + 1,
        italic: true,
      });
    } else if (code !== undefined) {
      segments.push({ text: code, rawStart: index + 1, code: true });
    } else if (linkText !== undefined) {
      segments.push({ text: linkText, rawStart: index + 1, href });
    } else if (strike !== undefined) {
      segments.push({ text: strike, rawStart: index + 2, strike: true });
    }
    cursor = index + match[0].length;
  }
  if (cursor < raw.length) {
    segments.push({ text: raw.slice(cursor), rawStart: cursor });
  }
  return segments;
}

/** Map a caret offset in the rendered text back into the raw markdown. */
export function renderedToRawOffset(raw: string, renderedOffset: number) {
  let consumed = 0;
  for (const segment of parseInline(raw)) {
    if (renderedOffset <= consumed + segment.text.length) {
      return segment.rawStart + (renderedOffset - consumed);
    }
    consumed += segment.text.length;
  }
  return raw.length;
}

export function plainText(raw: string) {
  return parseInline(raw)
    .map((segment) => segment.text)
    .join("");
}

export function countWords(blocks: DocBlock[]) {
  return blocks.reduce((total, block) => {
    const words = plainText(block.text).trim().split(/\s+/).filter(Boolean);
    return total + words.length;
  }, 0);
}

/** A line's words without bold, italics, code, links or strikethrough. */
export function plainInline(raw: string): string {
  return parseInline(raw)
    .map((segment) => segment.text)
    .join("");
}
