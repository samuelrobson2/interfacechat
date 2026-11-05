import type { TableColumn, TableColumnType, TableRow } from "./shell-types";

const IMAGE_MD = /^!\[[^\]]*\]\(([^)\s]+)\)$/;
const IMAGE_URL = /^https?:\/\/\S+\.(png|jpe?g|gif|webp|avif)(\?\S*)?$/i;

function splitRow(line: string) {
  const trimmed = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  const cells: string[] = [];
  let current = "";
  for (let i = 0; i < trimmed.length; i++) {
    const char = trimmed[i];
    if (char === "\\" && trimmed[i + 1] === "|") {
      current += "|";
      i++;
    } else if (char === "|") {
      cells.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  cells.push(current.trim());
  return cells;
}

function imageUrl(value: string) {
  const md = value.match(IMAGE_MD);
  if (md) return md[1];
  if (IMAGE_URL.test(value)) return value;
  return null;
}

function inferType(values: string[], columnIndex: number): TableColumnType {
  const filled = values.filter(Boolean);
  if (filled.length === 0) return "text";
  const images = filled.filter((value) => imageUrl(value)).length;
  if (images / filled.length >= 0.5) return "image";
  if (columnIndex === 0 || filled.length < 3) return "text";
  // Categories: short words, no numbers or lists, and at least one repeat.
  const categorical = filled.every(
    (value) =>
      value.length <= 24 &&
      value.split(/\s+/).length <= 3 &&
      !/\d/.test(value) &&
      !value.includes(","),
  );
  const distinct = new Set(filled.map((value) => value.toLowerCase())).size;
  return categorical &&
    distinct < filled.length &&
    distinct <= Math.ceil(filled.length * 0.85)
    ? "tag"
    : "text";
}

/** First GitHub-flavoured markdown table in the text, or null. */
export function parseMarkdownTable(
  markdown: string,
): { columns: TableColumn[]; rows: TableRow[] } | null {
  const lines = markdown.split("\n").map((line) => line.trim());
  const start = lines.findIndex(
    (line, i) =>
      line.startsWith("|") && /^\|?\s*:?-{2,}/.test(lines[i + 1] ?? ""),
  );
  if (start === -1) return null;

  const labels = splitRow(lines[start] ?? "");
  const body: string[][] = [];
  for (const line of lines.slice(start + 2)) {
    if (!line.startsWith("|")) break;
    body.push(splitRow(line));
  }

  // Positional ids, so re-parsing the same table keeps rows and columns stable.
  const columns: TableColumn[] = labels.map((label, index) => ({
    id: `col-${index}`,
    label: label.replace(/\*\*/g, ""),
    type: inferType(
      body.map((cells) => cells[index] ?? ""),
      index,
    ),
  }));

  const rows: TableRow[] = body.map((cells, rowIndex) => ({
    id: `row-${rowIndex}`,
    cells: Object.fromEntries(
      columns.map((column, index) => {
        const value = cells[index] ?? "";
        return [
          column.id,
          column.type === "image" ? (imageUrl(value) ?? "") : value,
        ];
      }),
    ),
  }));

  return { columns, rows };
}

const escapeCell = (value: string) => value.replace(/\|/g, "\\|").replace(/\n/g, " ");

export function serializeMarkdownTable(columns: TableColumn[], rows: TableRow[]) {
  if (columns.length === 0) return "";
  const header = `| ${columns.map((column) => escapeCell(column.label || " ")).join(" | ")} |`;
  const divider = `| ${columns.map(() => "---").join(" | ")} |`;
  const body = rows.map((row) => {
    const cells = columns.map((column) => {
      const value = row.cells[column.id] ?? "";
      if (column.type === "image" && value) return `![](${value})`;
      return escapeCell(value);
    });
    return `| ${cells.join(" | ")} |`;
  });
  return [header, divider, ...body].join("\n");
}
