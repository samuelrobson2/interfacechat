import type {
  Aggregate,
  Cell,
  Dataset,
  Query,
  Row,
  Variable,
  VariableValue,
  VariableValues,
  Where,
} from "./app-types";

/** The value a choice holds when it offers "All": filters reading it switch off. */
export const ALL = "__all__";

/* ── Variables ────────────────────────────────────────────────────────── */

export function defaultValues(variables: Variable[]): VariableValues {
  return Object.fromEntries(variables.map((variable) => [variable.id, variable.default]));
}

/** "$region" reads the region variable; anything else is itself. */
function resolve(operand: Where["value"], values: VariableValues): Where["value"] | VariableValue | undefined {
  if (typeof operand === "string" && operand.startsWith("$")) return values[operand.slice(1)];
  return operand;
}

/** A variable's value as words: the option's or step's label, not its id. */
export function displayValue(variable: Variable | undefined, value: VariableValue | undefined): string {
  if (!variable || value === undefined) return "";
  if (variable.kind === "choice") {
    if (value === ALL) return "all";
    return variable.options?.find((option) => option.value === value)?.label ?? String(value);
  }
  if (variable.kind === "slider") {
    const label = variable.labels?.[Math.round((Number(value) - variable.min) / variable.step)];
    return label ?? `${value}${variable.unit ?? ""}`;
  }
  return value ? "on" : "off";
}

/** Markdown with {{variable}} swapped for its current value. */
export function interpolate(markdown: string, variables: Variable[], values: VariableValues) {
  return markdown.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, id: string) => {
    const variable = variables.find((v) => v.id === id);
    return variable ? displayValue(variable, values[id]) : match;
  });
}

/* ── Queries ──────────────────────────────────────────────────────────── */

const asNumber = (cell: Cell | undefined) => (typeof cell === "number" ? cell : Number(cell));
const comparable = (a: Cell | undefined, b: unknown) =>
  typeof b === "number" ? asNumber(a) : String(a ?? "");

function matches(row: Row, clause: Where, values: VariableValues) {
  const value = resolve(clause.value, values);
  // An unset variable, or "All", means the filter doesn't apply.
  if (value === undefined || value === null || value === ALL || value === "") return true;
  const cell = row[clause.field];
  switch (clause.op) {
    case "eq":
      return String(cell) === String(value);
    case "neq":
      return String(cell) !== String(value);
    case "gt":
      return comparable(cell, value) > (value as number | string);
    case "gte":
      return comparable(cell, value) >= (value as number | string);
    case "lt":
      return comparable(cell, value) < (value as number | string);
    case "lte":
      return comparable(cell, value) <= (value as number | string);
    case "in":
      return Array.isArray(value) && value.map(String).includes(String(cell));
    case "contains":
      return String(cell ?? "").toLowerCase().includes(String(value).toLowerCase());
  }
}

export function runQuery(rows: Row[], query: Query | undefined, values: VariableValues): Row[] {
  if (!query) return rows;
  let out = query.where?.length ? rows.filter((row) => query.where!.every((clause) => matches(row, clause, values))) : rows;
  if (query.sort) {
    const { field, dir } = query.sort;
    const sign = dir === "asc" ? 1 : -1;
    out = [...out].sort((a, b) => {
      const x = a[field];
      const y = b[field];
      if (typeof x === "number" && typeof y === "number") return (x - y) * sign;
      return String(x ?? "").localeCompare(String(y ?? "")) * sign;
    });
  }
  return query.limit ? out.slice(0, query.limit) : out;
}

export function aggregate(rows: Row[], field: string, op: Aggregate): number | null {
  if (op === "count") return rows.length;
  const numbers = rows.map((row) => asNumber(row[field])).filter((n) => Number.isFinite(n));
  if (!numbers.length) return null;
  switch (op) {
    case "sum":
      return numbers.reduce((sum, n) => sum + n, 0);
    case "mean":
      return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
    case "min":
      return Math.min(...numbers);
    case "max":
      return Math.max(...numbers);
    case "last":
      return numbers[numbers.length - 1] ?? null;
  }
}

/** Distinct values of a column, in first-seen order: a choice's options when read from data. */
export function distinct(rows: Row[], field: string): string[] {
  return [...new Set(rows.map((row) => row[field]).filter((cell) => cell !== null && cell !== undefined).map(String))];
}

/* ── Shape ────────────────────────────────────────────────────────────── */

export type ColumnType = "number" | "date" | "text" | "boolean";

const DATE = /^\d{4}-\d{2}(-\d{2})?([T ][\d:.]+Z?)?$/;

export function columnsOf(rows: Row[]): { name: string; type: ColumnType }[] {
  const names = [...new Set(rows.slice(0, 50).flatMap((row) => Object.keys(row)))];
  return names.map((name) => {
    const cells = rows.slice(0, 50).map((row) => row[name]).filter((cell) => cell !== null && cell !== "");
    const type: ColumnType = cells.every((cell) => typeof cell === "number")
      ? "number"
      : cells.every((cell) => typeof cell === "boolean")
        ? "boolean"
        : cells.every((cell) => typeof cell === "string" && DATE.test(cell))
          ? "date"
          : "text";
    return { name, type };
  });
}

/** Which of `fields` a dataset doesn't have: a block reading them can't draw. */
export function missingFields(dataset: Dataset | undefined, rows: Row[], fields: (string | undefined)[]) {
  if (!dataset || rows.length === 0) return [];
  const have = new Set(Object.keys(rows[0] ?? {}));
  return fields.filter((field): field is string => Boolean(field) && !have.has(field!));
}

/* ── Parsing what people bring ────────────────────────────────────────── */

/** "1,200" and "12.5%" stay strings only when they aren't numbers; empty cells are null. */
function typedCell(raw: string): Cell {
  const text = raw.trim();
  if (text === "") return null;
  if (/^(true|false)$/i.test(text)) return text.toLowerCase() === "true";
  const numeric = text.replace(/,(?=\d{3}\b)/g, "");
  if (/^-?\d+(\.\d+)?$/.test(numeric)) return Number(numeric);
  return text;
}

/** CSV or TSV with quoted fields, doubled quotes and newlines inside quotes. */
export function parseDelimited(text: string): Row[] {
  const delimiter = (text.split("\n")[0] ?? "").includes("\t") ? "\t" : ",";
  const records: string[][] = [];
  let field = "";
  let record: string[] = [];
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (char === '"') quoted = false;
      else field += char;
    } else if (char === '"') quoted = true;
    else if (char === delimiter) {
      record.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") i++;
      record.push(field);
      records.push(record);
      record = [];
      field = "";
    } else field += char;
  }
  if (field || record.length) {
    record.push(field);
    records.push(record);
  }
  const [header, ...body] = records.filter((r) => r.some((cell) => cell.trim() !== ""));
  if (!header) return [];
  const names = header.map((name, index) => name.trim() || `column_${index + 1}`);
  return body.map((cells) => Object.fromEntries(names.map((name, index) => [name, typedCell(cells[index] ?? "")])));
}

/** An array of objects, or the first array of objects inside the payload (`{ data: [...] }`). */
export function parseJsonRows(value: unknown): Row[] {
  const isRows = (v: unknown): v is Record<string, unknown>[] =>
    Array.isArray(v) && v.length > 0 && v.every((item) => item !== null && typeof item === "object" && !Array.isArray(item));
  const found = isRows(value)
    ? value
    : value && typeof value === "object"
      ? Object.values(value).find(isRows)
      : undefined;
  if (!found) return [];
  return found.map((item) =>
    Object.fromEntries(
      Object.entries(item).map(([key, cell]) => [
        key,
        cell === null || typeof cell === "number" || typeof cell === "boolean"
          ? cell
          : typeof cell === "string"
            ? typedCell(cell)
            : JSON.stringify(cell),
      ]),
    ),
  );
}

/** Keeps a dataset small enough to live in the spec and travel to the model. */
export const MAX_ROWS = 5000;

export function parseData(text: string, format: "csv" | "json"): Row[] {
  const rows = format === "json" ? parseJsonRows(JSON.parse(text)) : parseDelimited(text);
  return rows.slice(0, MAX_ROWS);
}

/** A dataset id from a file or link name: "Café sales 2026.csv" → "cafe_sales_2026". */
export function datasetId(name: string, taken: string[]) {
  const base =
    name
      .replace(/\.[a-z]+$/i, "")
      .normalize("NFKD")
      .replace(/[^\w\s-]/g, "")
      .trim()
      .toLowerCase()
      .replace(/[\s-]+/g, "_") || "data";
  let id = base;
  for (let n = 2; taken.includes(id); n++) id = `${base}_${n}`;
  return id;
}
