import type {
  ArticleShellData,
  ChartShellData,
  DashboardShellData,
  DocumentShellData,
  GeneratorShellData,
  MoodboardShellData,
  ScheduleShellData,
  SearchShellData,
  TableShellData,
  TrackerItem,
  TrackerShellData,
} from "@/features/interface-shells";
import { clip, mix, plural, type ToolContext } from "./tool-helpers";
import type { GeneratedTool, ToolIcon } from "./tool-spec";
import { canvasTools } from "./generate-tools-canvas";
import { diagramTools } from "./generate-tools-diagram";
import { generatorTools, scheduleTools, searchTools } from "./generate-tools-more";
import { articleTools, dashboardTools } from "./generate-tools-apps";
import { withoutStandard } from "./standard-tools";

export type { GeneratedTool, ToolContext, ToolIcon };

/** The large interfaces the generative toolbar is being tried on. */
export const TOOLBAR_KINDS = [
  "document",
  "table",
  "tracker",
  "chart",
  "moodboard",
  "search",
  "schedule",
  "generator",
  "dashboard",
  "article",
] as const;
export type ToolbarKind = (typeof TOOLBAR_KINDS)[number];

export type ToolbarDataByKind = {
  document: DocumentShellData;
  table: TableShellData;
  tracker: TrackerShellData;
  chart: ChartShellData;
  moodboard: MoodboardShellData;
  search: SearchShellData;
  schedule: ScheduleShellData;
  generator: GeneratorShellData;
  dashboard: DashboardShellData;
  article: ArticleShellData;
};



/* ── Document ─────────────────────────────────────────────────────────── */

function firstSentence(body: string) {
  const prose = body
    .split(/\n\n+/)
    .find((block) => block.trim() && !/^(#|>|-|\d+\.)/.test(block.trim()));
  return prose?.match(/[^.!?]+[.!?]/)?.[0]?.trim() ?? "";
}

/** The first bullet or numbered list in the body, turned into a one-column table. */
function listToTable(body: string, heading: string) {
  const blocks = body.split(/\n\n/);
  const index = blocks.findIndex((block) =>
    block.split("\n").every((line) => /^\s*(-|\*|\d+\.)\s/.test(line)),
  );
  if (index < 0) return body;
  const rows = (blocks[index] ?? "")
    .split("\n")
    .map((line) => `| ${line.replace(/^\s*(-|\*|\d+\.)\s/, "").trim()} |`);
  blocks[index] = [`| ${heading} |`, "| --- |", ...rows].join("\n");
  return blocks.join("\n\n");
}

function documentActions(
  data: DocumentShellData,
  { selection }: ToolContext,
): GeneratedTool<DocumentShellData>[] {
  if (selection) {
    const quoted = `“${clip(selection)}”`;
    const shorter = (selection.split(/[,;:—]/)[0] ?? selection).trim().replace(/[.]?$/, ".");
    return [
      {
        type: "action",
        id: "sel-shorten",
        label: "Shorten this",
        detail: `Cut ${quoted} down to its point`,
        icon: "scissors",
        apply: (d) => ({ ...d, body: d.body.replace(selection, shorter) }),
      },
      {
        type: "action",
        id: "sel-bold",
        label: "Make it stand out",
        detail: `Bold ${quoted}`,
        icon: "text",
        apply: (d) => ({ ...d, body: d.body.replace(selection, `**${selection}**`) }),
      },
      {
        type: "action",
        id: "sel-source",
        label: "Find a source",
        detail: `Back ${quoted} with a citation`,
        icon: "search",
      },
      {
        type: "action",
        id: "sel-example",
        label: "Add an example",
        detail: `Follow ${quoted} with a concrete case`,
        icon: "sparkles",
      },
      {
        type: "action",
        id: "sel-rewrite",
        label: "Say it plainly",
        detail: `Rewrite ${quoted} for a general reader`,
        icon: "text",
      },
    ];
  }

  const body = data.body.trim();
  const tools: GeneratedTool<DocumentShellData>[] = [];

  if (!body) {
    const topic = data.title.trim() || "this";
    tools.push(
      {
        type: "action",
        id: "outline",
        label: "Draft an outline",
        detail: `Four sections on ${clip(topic, 32)}`,
        icon: "list",
        apply: (d) => ({
          ...d,
          body: ["## Background", "## The problem", "## What works", "## Recommendations"].join("\n\n"),
        }),
      },
      {
        type: "action",
        id: "intro",
        label: "Write the opening",
        detail: "A first paragraph to build from",
        icon: "text",
      },
      {
        type: "action",
        id: "research",
        label: "Research first",
        detail: `Gather sources on ${clip(topic, 32)}`,
        icon: "search",
      },
    );
  }

  if (!data.title.trim()) {
    const heading = body.match(/^#{1,3} (.+)$/m)?.[1];
    const guess = heading ?? body.split(/\s+/).slice(0, 5).join(" ");
    tools.push({
      type: "action",
      id: "title",
      label: "Suggest a title",
      detail: guess ? `Something like “${clip(guess)}”` : "From what you write",
      icon: "sparkles",
      apply: guess ? (d) => ({ ...d, title: guess }) : undefined,
    });
  }

  if (body) {
    const words = body.split(/\s+/).filter(Boolean).length;
    const headings = body.match(/^#{1,3} .+$/gm) ?? [];
    const hasList = /^\s*(-|\*|\d+\.)\s/m.test(body);
    const hasSummary = /^>\s*\*\*Summary/m.test(body);
    const opening = firstSentence(body);

    if (!hasSummary && words > 60 && opening) {
      tools.push({
        type: "action",
        id: "summary",
        label: "Add a summary",
        detail: "One line at the top for skimmers",
        icon: "sparkles",
        apply: (d) => ({ ...d, body: `> **Summary:** ${opening}\n\n${d.body}` }),
      });
    }
    if (hasList) {
      tools.push({
        type: "action",
        id: "list-table",
        label: "List to table",
        detail: "Turn the first list into a table",
        icon: "table",
        apply: (d) => ({ ...d, body: listToTable(d.body, headings[0]?.replace(/^#+ /, "") ?? "Item") }),
      });
    }
    if (headings.length < 4) {
      tools.push({
        type: "action",
        id: "next-section",
        label: headings.length ? "Write the next section" : "Add section headings",
        detail: headings.length
          ? `After “${clip((headings[headings.length - 1] ?? "").replace(/^#+ /, ""))}”`
          : "Break the draft into parts",
        icon: "list",
      });
    }
    if (!/^## (Conclusion|In short)/im.test(body)) {
      tools.push({
        type: "action",
        id: "conclusion",
        label: "Add a conclusion",
        detail: "Close on what the reader should do",
        icon: "check",
        apply: (d) => ({
          ...d,
          body: `${d.body}\n\n## Conclusion\n\n${
            d.title ? `${d.title} is` : "This is"
          } a problem with known fixes; the work is in doing them where they are needed most.`,
        }),
      });
    }
    tools.push(
      {
        type: "action",
        id: "cite",
        label: "Cite the numbers",
        detail: `${(body.match(/\d[\d.,–%°]*/g) ?? []).length} figures without a source`,
        icon: "search",
      },
    );
  }

  return tools;
}

/* ── Table ────────────────────────────────────────────────────────────── */

function minutesOf(value: string) {
  const hours = Number(value.match(/(\d+(?:\.\d+)?)\s*h/)?.[1] ?? 0);
  const minutes = Number(value.match(/(\d+)\s*min/)?.[1] ?? 0);
  return hours * 60 + minutes;
}

const formatMinutes = (total: number) =>
  total >= 60 ? `${Math.floor(total / 60)}h${total % 60 ? ` ${total % 60}m` : ""}` : `${total}m`;

function tableActions(
  data: TableShellData,
  { selection }: ToolContext,
): GeneratedTool<TableShellData>[] {
  const textColumns = data.columns.filter((column) => column.type !== "image");
  const tagColumns = data.columns.filter((column) => column.type === "tag");
  const imageColumn = data.columns.find((column) => column.type === "image");

  if (selection) {
    const column = data.columns.find((c) => data.rows.some((row) => row.cells[c.id] === selection));
    const quoted = `“${clip(selection, 20)}”`;
    return [
      {
        type: "action",
        id: "sel-filter",
        label: `Only ${clip(selection, 16)}`,
        detail: column ? `Filter ${column.label} to ${quoted}` : `Filter rows to ${quoted}`,
        icon: "list",
        apply: column
          ? (d) => ({ ...d, rows: d.rows.filter((row) => row.cells[column.id] === selection) })
          : undefined,
      },
      {
        type: "action",
        id: "sel-fill-down",
        label: "Fill down",
        detail: column ? `Copy ${quoted} into empty ${column.label} cells` : `Copy ${quoted} down`,
        icon: "table",
        apply: column
          ? (d) => ({
              ...d,
              rows: d.rows.map((row) =>
                row.cells[column.id] ? row : { ...row, cells: { ...row.cells, [column.id]: selection } },
              ),
            })
          : undefined,
      },
      {
        type: "action",
        id: "sel-explain",
        label: "Why this?",
        detail: `Explain ${quoted} in this row`,
        icon: "sparkles",
      },
    ];
  }

  const tools: GeneratedTool<TableShellData>[] = [];

  if (data.rows.length === 0) {
    tools.push({
      type: "action",
      id: "rows",
      label: data.rowCount ? `Fill ${data.rowCount} rows` : "Fill the rows",
      detail: data.description || `From the ${plural(textColumns.length, "column")} you set up`,
      icon: "sparkles",
    });
  }

  const empty = data.rows.reduce(
    (count, row) => count + textColumns.filter((column) => !row.cells[column.id]?.trim()).length,
    0,
  );
  if (empty > 0) {
    tools.push({
      type: "action",
      id: "fill-empty",
      label: `Fill ${plural(empty, "empty cell")}`,
      detail: "From what the other columns say",
      icon: "sparkles",
    });
  }

  const timeColumn = data.columns.find((column) => /time|duration|length/i.test(column.label));
  if (timeColumn && data.rows.length > 1) {
    const total = data.rows.reduce((sum, row) => sum + minutesOf(row.cells[timeColumn.id] ?? ""), 0);
    if (total > 0 && !data.columns.some((column) => column.id === "running")) {
      tools.push({
        type: "action",
        id: "running-total",
        label: `Running total · ${formatMinutes(total)}`,
        detail: `Add up ${timeColumn.label} row by row`,
        icon: "clock",
        apply: (d) => {
          let sum = 0;
          return {
            ...d,
            columns: [...d.columns, { id: "running", label: "Running time", type: "text" }],
            rows: d.rows.map((row) => {
              sum += minutesOf(row.cells[timeColumn.id] ?? "");
              return { ...row, cells: { ...row.cells, running: formatMinutes(sum) } };
            }),
          };
        },
      });
    }
  }

  const sortBy = tagColumns[0];
  if (sortBy && data.rows.length > 1) {
    tools.push({
      type: "action",
      id: `sort-${sortBy.id}`,
      jobs: ["sort"],
      label: `Sort by ${sortBy.label}`,
      detail: `${new Set(data.rows.map((row) => row.cells[sortBy.id])).size} kinds of ${sortBy.label.toLowerCase()}`,
      icon: "sort",
      apply: (d) => ({
        ...d,
        rows: [...d.rows].sort((a, b) =>
          (a.cells[sortBy.id] ?? "").localeCompare(b.cells[sortBy.id] ?? ""),
        ),
      }),
    });
  }

  if (data.rows.length > 0 && !data.columns.some((column) => /status/i.test(column.label))) {
    tools.push({
      type: "action",
      id: "status",
      label: "Add a Status column",
      detail: "Track each row as To do, Doing, Done",
      icon: "plus",
      apply: (d) => ({
        ...d,
        columns: [...d.columns, { id: "status", label: "Status", type: "tag" }],
        rows: d.rows.map((row) => ({ ...row, cells: { ...row.cells, status: "To do" } })),
      }),
    });
  }

  if (imageColumn) {
    const missing = data.rows.filter((row) => !row.cells[imageColumn.id]).length;
    if (missing > 0) {
      tools.push({
        type: "action",
        id: "images",
        label: `Find ${plural(missing, "image")}`,
        detail: `For the empty ${imageColumn.label} cells`,
        icon: "image",
      });
    }
  }

  const chartBy = tagColumns[1] ?? tagColumns[0];
  if (chartBy && data.rows.length > 2) {
    tools.push({
      type: "action",
      id: "chart",
      label: `Chart ${chartBy.label}`,
      detail: `How the ${plural(data.rows.length, "row")} split`,
      icon: "chart",
    });
  }

  if (data.rows.length > 0) {
    tools.push({
      type: "action",
      id: "more-rows",
      label: "Suggest more rows",
      detail: data.description ? clip(data.description, 40) : "What's missing from the list",
      icon: "plus",
    });
  }

  return tools;
}

/* ── Checklist ────────────────────────────────────────────────────────── */

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

/** "Fri 4 Dec" → a sortable number; undated items sort last. */
function dueOrder(due?: string) {
  const match = due?.toLowerCase().match(/(\d{1,2})\s+([a-z]{3})/);
  if (!match) return Number.POSITIVE_INFINITY;
  const month = MONTHS.indexOf(match[2] ?? "");
  return month < 0 ? Number.POSITIVE_INFINITY : month * 100 + Number(match[1]);
}

function trackerActions(
  data: TrackerShellData,
  { selection }: ToolContext,
): GeneratedTool<TrackerShellData>[] {
  const open = data.items.filter((item) => !item.done);
  const owners = [...new Set(data.items.map((item) => item.owner).filter(Boolean))] as string[];

  if (selection) {
    const item = data.items.find((i) => i.label.includes(selection));
    const quoted = `“${clip(item?.label ?? selection, 24)}”`;
    return [
      {
        type: "action",
        id: "sel-break",
        label: "Break it down",
        detail: `Split ${quoted} into steps`,
        icon: "list",
        apply: item
          ? (d) => {
              const at = d.items.findIndex((i) => i.id === item.id);
              const steps: TrackerItem[] = ["Get options", "Decide", "Confirm in writing"].map((step, n) => ({
                id: `${item.id}-step-${n}-${Date.now()}`,
                label: `${step}: ${item.label.toLowerCase()}`,
                owner: item.owner,
                group: item.group,
                done: false,
              }));
              return { ...d, items: [...d.items.slice(0, at), ...steps, ...d.items.slice(at + 1)] };
            }
          : undefined,
      },
      {
        type: "action",
        id: "sel-draft",
        label: "Draft the message",
        detail: `What to send for ${quoted}`,
        icon: "text",
      },
      {
        type: "action",
        id: "sel-done",
        label: "Mark done",
        detail: quoted,
        icon: "check",
        apply: item
          ? (d) => ({ ...d, items: d.items.map((i) => (i.id === item.id ? { ...i, done: true } : i)) })
          : undefined,
      },
    ];
  }

  const tools: GeneratedTool<TrackerShellData>[] = [];

  if (data.items.length === 0) {
    tools.push({
      type: "action",
      id: "draft",
      label: "Draft the checklist",
      detail: data.title ? `Everything for ${clip(data.title, 30)}` : "From the title and chat",
      icon: "sparkles",
    });
    if (data.groups.length === 0) {
      tools.push({
        type: "action",
        id: "groups",
        label: "Suggest groups",
        detail: "Before, during, after",
        icon: "list",
        apply: (d) => ({ ...d, groups: ["Before", "During", "After"] }),
      });
    }
    return tools;
  }

  const unowned = open.filter((item) => !item.owner);
  if (unowned.length) {
    tools.push({
      type: "action",
      id: "owners",
      label: `Assign ${plural(unowned.length, "owner")}`,
      detail: owners.length ? `Spread across ${owners.slice(0, 3).join(", ")}` : "Give each open item to someone",
      icon: "user",
      apply: (d) => {
        let n = 0;
        const pool = owners.length ? owners : ["You"];
        return {
          ...d,
          items: d.items.map((item) =>
            item.done || item.owner ? item : { ...item, owner: pool[n++ % pool.length] },
          ),
        };
      },
    });
  }

  const undated = open.filter((item) => !item.due);
  if (undated.length) {
    tools.push({
      type: "action",
      id: "deadlines",
      label: `Date ${plural(undated.length, "item")}`,
      detail: "Work back from the shoot",
      icon: "calendar",
    });
  }

  const dated = data.items.filter((item) => Number.isFinite(dueOrder(item.due)));
  if (dated.length > 2) {
    const next = [...open].sort((a, b) => dueOrder(a.due) - dueOrder(b.due))[0];
    tools.push({
      type: "action",
      id: "sort-due",
      jobs: ["sort"],
      label: "Sort by due date",
      detail: next?.due ? `Next up: ${clip(next.label, 24)} · ${next.due}` : "Soonest first",
      icon: "sort",
      apply: (d) => ({ ...d, items: [...d.items].sort((a, b) => dueOrder(a.due) - dueOrder(b.due)) }),
    });
  }

  const finished = data.groups.filter((group) => {
    const items = data.items.filter((item) => item.group === group);
    return items.length > 0 && items.every((item) => item.done);
  });
  if (finished.length) {
    tools.push({
      type: "action",
      id: "archive",
      label: `Archive ${finished[0]}`,
      detail: "Every item in it is done",
      icon: "archive",
      apply: (d) => ({
        ...d,
        groups: d.groups.filter((group) => group !== finished[0]),
        items: d.items.filter((item) => item.group !== finished[0]),
      }),
    });
  }

  const load = owners
    .map((owner) => ({ owner, count: open.filter((item) => item.owner === owner).length }))
    .sort((a, b) => b.count - a.count);
  const busy = load[0];
  const free = load[load.length - 1];
  if (busy && free && busy !== free && busy.count - free.count > 1) {
    tools.push({
      type: "action",
      id: "rebalance",
      label: `Ease ${busy.owner}'s load`,
      detail: `${busy.owner} has ${busy.count} open, ${free.owner} has ${free.count}`,
      icon: "user",
      apply: (d) => {
        const moving = d.items.find((item) => !item.done && item.owner === busy.owner);
        return {
          ...d,
          items: d.items.map((item) => (item === moving ? { ...item, owner: free.owner } : item)),
        };
      },
    });
  }

  if (open.length && owners.length) {
    tools.push({
      type: "action",
      id: "remind",
      label: "Send reminders",
      detail: `To ${owners.filter((owner) => open.some((item) => item.owner === owner)).join(", ")}`,
      icon: "bell",
    });
  }

  const biggest = [...open].sort((a, b) => b.label.length - a.label.length)[0];
  if (biggest) {
    tools.push({
      type: "action",
      id: "break",
      label: "Break down a step",
      detail: `“${clip(biggest.label, 30)}”`,
      icon: "list",
    });
  }

  return tools;
}

/* ── Controls: sliders, 2×2 pads, choices, toggles ─────────────────── */

const wordsIn = (text: string) => text.split(/\s+/).filter(Boolean).length;
const roundTo = (n: number, step: number) => Math.max(step, Math.round(n / step) * step);

/** Keeps the first `sentences` of every prose paragraph; headings, lists and quotes stay. */
function trimProse(body: string, sentences: number) {
  return body
    .split(/\n\n/)
    .map((block) => {
      if (/^(#|>|-|\*|\d+\.)/.test(block.trim())) return block;
      const parts = block.match(/[^.!?]+[.!?]+/g);
      return parts && parts.length > sentences ? parts.slice(0, sentences).join("").trim() : block;
    })
    .join("\n\n");
}

/** How chatty the writing is, 0 (formal) to 1 (casual), from contractions and "you". */
function casualness(body: string) {
  const words = Math.max(1, wordsIn(body));
  const marks = (body.match(/\b(\w+'(s|re|ll|ve|t|d)|you|your|we|our)\b/gi) ?? []).length;
  return Math.min(0.85, Math.max(0.15, (marks / words) * 12));
}

const TONE = {
  x: { low: "Formal", high: "Casual" },
  y: { low: "Brief", high: "Detailed" },
  quadrants: ["Report", "Feature", "Memo", "Post"] as [string, string, string, string],
};

function documentControls(
  data: DocumentShellData,
  { selection }: ToolContext,
): GeneratedTool<DocumentShellData>[] {
  const body = data.body.trim();

  if (selection) {
    const words = wordsIn(selection);
    return [
      {
        type: "grid",
        id: "sel-tone",
        label: "Tone",
        detail: `Rewrite “${clip(selection, 20)}” in another register`,
        icon: "grid",
        ...TONE,
        value: { x: casualness(selection), y: Math.min(0.9, words / 60) },
      },
      {
        type: "choice",
        id: "sel-turn-into",
        label: "Turn into",
        detail: "Change what kind of block this is",
        icon: "text",
        options: [
          { id: "bullet", label: "Bullet" },
          { id: "quote", label: "Quote" },
          { id: "heading", label: "Heading" },
        ],
        value: "",
        apply: (d, value) => {
          const as = value === "bullet" ? `- ${selection}` : value === "quote" ? `> ${selection}` : `## ${selection}`;
          const body = d.body.replace(selection, `\n\n${as}\n\n`).replace(/\n{3,}/g, "\n\n").trim();
          return { ...d, body };
        },
      },
      {
        type: "slider",
        id: "sel-length",
        label: "Length",
        detail: "Say it in fewer or more words",
        icon: "sliders",
        min: { label: "Shorter" },
        max: { label: "Longer" },
        steps: ["Half", "As is", "Double"],
        value: 1,
        apply: (d, value) =>
          value === 0
            ? { ...d, body: d.body.replace(selection, (selection.split(/[,;:—]/)[0] ?? selection).trim().replace(/[.]?$/, ".")) }
            : d,
      },
    ];
  }

  if (!body) {
    const lengths = ["~300 words", "~800 words", "~1,500 words", "~3,000 words"];
    const current = Math.max(0, lengths.indexOf(data.length ?? ""));
    return [
      {
        type: "choice",
        id: "format",
        label: "Format",
        detail: "What kind of writing this is",
        icon: "text",
        options: [
          { id: "paper", label: "Paper" },
          { id: "memo", label: "Memo" },
          { id: "post", label: "Post" },
        ],
        value: "paper",
      },
      {
        type: "slider",
        id: "target-length",
        label: "Length",
        detail: "How long it should end up",
        icon: "sliders",
        min: { label: "Short" },
        max: { label: "Long" },
        steps: lengths,
        value: data.length ? current : 2,
        apply: (d, value) => ({ ...d, length: lengths[value] ?? d.length }),
      },
    ];
  }

  const words = wordsIn(body);
  const factors = [0.4, 0.7, 1, 1.5, 2];
  const targets = factors.map((factor) => roundTo(words * factor, 50));
  return [
    {
      type: "grid",
      id: "tone",
      label: "Tone",
      detail: "Move it toward a memo, report, post or feature",
      icon: "grid",
      ...TONE,
      value: { x: casualness(body), y: Math.min(0.9, Math.max(0.1, words / 900)) },
    },
    {
      type: "slider",
      id: "length",
      label: "Length",
      detail: `${words} words now${data.length ? `, aiming for ${data.length}` : ""}`,
      icon: "sliders",
      min: { label: "Shorter" },
      max: { label: "Longer" },
      steps: targets.map((target, index) => (index === 2 ? `${words} now` : `~${target.toLocaleString()}`)),
      value: 2,
      // Shorter can be done here, by trimming paragraphs; longer needs the model.
      apply: (d, value) =>
        value < 2
          ? { ...d, length: `~${targets[value]?.toLocaleString()} words`, body: trimProse(d.body, value === 0 ? 1 : 2) }
          : d,
    },
    {
      type: "choice",
      id: "audience",
      label: "For",
      detail: "Who it's written for",
      icon: "users",
      options: [
        { id: "general", label: "Everyone" },
        { id: "expert", label: "Experts" },
        { id: "students", label: "Students" },
      ],
      value: "general",
    },
    {
      type: "toggle",
      id: "cite-as-it-goes",
      label: "Cite as it goes",
      detail: "Add a source after every figure",
      icon: "search",
      value: false,
    },
  ];
}

function tableControls(data: TableShellData, { selection }: ToolContext): GeneratedTool<TableShellData>[] {
  if (selection) return [];
  const n = data.rows.length;
  if (n === 0) {
    return [
      {
        type: "slider",
        id: "row-count",
        label: "Rows",
        detail: "How many to fill",
        icon: "sliders",
        min: { label: "Few" },
        max: { label: "Many" },
        steps: ["6", "12", "24", "48"],
        value: 1,
      },
    ];
  }

  const tagColumns = data.columns.filter((column) => column.type === "tag").slice(0, 2);
  const imageColumn = data.columns.find((column) => column.type === "image");
  const counts = [...new Set([Math.max(1, Math.ceil(n / 2)), n, n + 4, n + 8, n * 2])].sort((a, b) => a - b);
  const rowNumber = (id: string) => Number(id.match(/\d+/)?.[0] ?? 0);

  return [
    {
      type: "choice",
      id: "sort",
      jobs: ["sort"],
      label: "Sort",
      detail: "Reorder the rows",
      icon: "sort",
      options: [
        { id: "order", label: "Order" },
        ...tagColumns.map((column) => ({ id: column.id, label: clip(column.label, 14) })),
      ],
      value: "order",
      apply: (d, value) => ({
        ...d,
        rows: [...d.rows].sort((a, b) =>
          value === "order"
            ? rowNumber(a.id) - rowNumber(b.id)
            : (a.cells[value] ?? "").localeCompare(b.cells[value] ?? ""),
        ),
      }),
    },
    {
      type: "slider",
      id: "rows",
      label: "Rows",
      detail: `${n} now`,
      icon: "sliders",
      min: { label: "Fewer" },
      max: { label: "More" },
      steps: counts.map(String),
      value: counts.indexOf(n),
      apply: (d, value) => {
        const target = counts[value] ?? n;
        return target < d.rows.length ? { ...d, rows: d.rows.slice(0, target) } : d;
      },
    },
    {
      type: "toggle",
      id: "images",
      label: "Images",
      detail: imageColumn ? `Show the ${imageColumn.label} column` : "Find a picture for each row",
      icon: "image",
      value: Boolean(imageColumn),
      apply: (d, value) =>
        !value && imageColumn
          ? { ...d, columns: d.columns.filter((column) => column.id !== imageColumn.id) }
          : d,
    },
  ];
}

function trackerControls(data: TrackerShellData, { selection }: ToolContext): GeneratedTool<TrackerShellData>[] {
  if (selection || data.items.length === 0) return [];
  return [
    {
      type: "grid",
      id: "prioritise",
      label: "Prioritise",
      detail: "Order by impact and effort",
      icon: "grid",
      x: { low: "Easy", high: "Hard" },
      y: { low: "Low impact", high: "High impact" },
      quadrants: ["Quick wins", "Big bets", "Fill-ins", "Time sinks"],
      value: { x: 0.5, y: 0.5 },
    },
    {
      type: "choice",
      id: "order",
      label: "Order",
      detail: "How the list is arranged",
      icon: "sort",
      options: [
        { id: "group", label: "Group" },
        { id: "due", label: "Due" },
        { id: "owner", label: "Owner" },
      ],
      value: "group",
      apply: (d, value) => ({
        ...d,
        items: [...d.items].sort((a, b) =>
          value === "due"
            ? dueOrder(a.due) - dueOrder(b.due)
            : value === "owner"
              ? (a.owner ?? "~").localeCompare(b.owner ?? "~")
              : d.groups.indexOf(a.group ?? "") - d.groups.indexOf(b.group ?? ""),
        ),
      }),
    },
    {
      type: "slider",
      id: "detail",
      label: "Detail",
      detail: "Fewer, bigger steps or more, smaller ones",
      icon: "sliders",
      min: { label: "Fewer" },
      max: { label: "More" },
      steps: ["Headlines", "Steps", "Every step"],
      value: 1,
    },
    {
      type: "toggle",
      id: "notify",
      label: "Notify owners",
      detail: "Message each owner when their item changes",
      icon: "bell",
      value: false,
    },
  ];
}

const documentTools = (data: DocumentShellData, context: ToolContext) =>
  mix(documentControls(data, context), documentActions(data, context));
const tableTools = (data: TableShellData, context: ToolContext) =>
  mix(tableControls(data, context), tableActions(data, context));
const trackerTools = (data: TrackerShellData, context: ToolContext) =>
  mix(trackerControls(data, context), trackerActions(data, context));

/* ── All ──────────────────────────────────────────────────────────────── */

/**
 * Every tool that fits the interface as it stands, best first. A stand-in for
 * the model: it reads the same things the model would (what's empty, what's
 * unowned, what's selected) and names tools after them.
 */
const GENERATORS: { [K in ToolbarKind]: (data: ToolbarDataByKind[K], context: ToolContext) => GeneratedTool<ToolbarDataByKind[K]>[] } = {
  document: documentTools,
  table: tableTools,
  tracker: trackerTools,
  chart: diagramTools,
  moodboard: canvasTools,
  search: searchTools,
  schedule: scheduleTools,
  generator: generatorTools,
  dashboard: dashboardTools,
  article: articleTools,
};

export function generateTools<K extends ToolbarKind>(
  kind: K,
  data: ToolbarDataByKind[K],
  context: ToolContext,
): GeneratedTool<ToolbarDataByKind[K]>[] {
  const tools = (GENERATORS[kind] as (data: ToolbarDataByKind[K], context: ToolContext) => GeneratedTool<ToolbarDataByKind[K]>[])(
    data,
    context,
  );
  return withoutStandard(kind, tools);
}
