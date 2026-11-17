import {
  appToCatalogue,
  catalogueToApp,
  catalogueToPieces,
  piecesToCatalogue,
  EMPTY_SHELL_DATA,
  type AppShellData,
  serializeMarkdownTable,
  type CatalogueKind,
  type CatalogueValue,
  type CatalogueValueByKind,
  type GeneratorShellData,
  type GuideShellData,
  type ScheduleShellData,
  type TableColumn,
  type TrackerShellData,
} from "@/features/interface-shells";

/** Library interfaces the model fills through the catalogue, each holding its own data. */
const SHELL_CATALOGUE: CatalogueKind[] = ["tracker", "dashboard", "guide", "schedule", "generator"];

const toHours = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return (h ?? 0) + (m ?? 0) / 60;
};
const toHHMM = (hours: number) => `${String(Math.floor(hours)).padStart(2, "0")}:${String(Math.round((hours % 1) * 60)).padStart(2, "0")}`;
import type { ArtefactShell, ChatLabArtefact, ChatLabArtefactKind } from "./chat-lab-store";
import { artefactDocument, artefactTable } from "./shell-adapters";

/** Which catalogue entry an interface in a thread is, if the model can fill it. */
export function artefactCatalogueKind(artefact: ChatLabArtefact): CatalogueKind | null {
  if (artefact.kind === "document" || artefact.kind === "table") return artefact.kind;
  const shellKind = artefact.kind === "shell" ? artefact.shell?.kind : undefined;
  if (shellKind && (SHELL_CATALOGUE as string[]).includes(shellKind)) return shellKind as CatalogueKind;
  return null;
}

/** An interface's contents in its catalogue shape: what the model reads and patches. */
export function artefactCatalogueValue(artefact: ChatLabArtefact): CatalogueValue | null {
  const kind = artefactCatalogueKind(artefact);
  if (kind === "document") {
    const doc = artefactDocument(artefact);
    // Live pieces go with it, as the model reads a dashboard's.
    const pieces = artefact.pieces?.blocks.length || artefact.pieces?.datasets.length ? piecesToCatalogue(artefact.pieces) : null;
    return { title: doc.title, body: doc.body, ...(pieces ?? {}) };
  }
  if (kind === "table") {
    const table = artefactTable(artefact);
    return {
      title: table.title,
      columns: table.columns.map((column) => ({ label: column.label, type: column.type })),
      rows: table.rows.map((row) => table.columns.map((column) => row.cells[column.id] ?? "")),
    };
  }
  if (kind === "tracker") {
    const data = artefact.shell!.data as TrackerShellData;
    return {
      title: data.title,
      ...(data.groups.length ? { groups: data.groups } : {}),
      items: data.items.map(({ label, owner, due, done, group }) => ({
        label,
        ...(owner ? { owner } : {}),
        ...(due ? { due } : {}),
        done,
        ...(group ? { group } : {}),
      })),
    };
  }
  if (kind === "dashboard") return appToCatalogue(artefact.shell!.data as AppShellData);
  if (kind === "guide") {
    const data = artefact.shell!.data as GuideShellData;
    return {
      title: data.title,
      facts: data.facts,
      needs: data.needs.map(({ text, group }) => ({ text, ...(group ? { group } : {}) })),
      steps: data.steps.map(({ text, minutes, note }) => ({ text, ...(minutes ? { minutes } : {}), ...(note ? { note } : {}) })),
    };
  }
  if (kind === "schedule") {
    const data = artefact.shell!.data as ScheduleShellData;
    return {
      title: data.title,
      ...(data.start ? { start: data.start } : {}),
      dayCount: data.dayCount,
      hours: [toHHMM(data.hours[0]), toHHMM(data.hours[1])],
      constraints: data.constraints,
      tasks: data.tasks.map((task) => ({ label: task.label, day: task.day + 1, start: toHHMM(task.start), end: toHHMM(task.end), type: task.type })),
    };
  }
  if (kind === "generator") {
    const data = artefact.shell!.data as GeneratorShellData;
    const texts = data.variations.flatMap((variation) => (variation.text ? [variation.text] : []));
    return {
      title: data.title,
      mode: data.mode,
      ...(data.mode === "text" ? { tone: data.controls.tone, length: data.controls.length } : { style: data.controls.style, aspect: data.controls.aspect }),
      ...(texts.length ? { variations: texts } : {}),
    };
  }
  return null;
}

type ArtefactPatch = { title?: string; content?: string; shell?: ArtefactShell; pieces?: ChatLabArtefact["pieces"] };

/** A catalogue value as a change to the interface that holds it. */
export function catalogueArtefactPatch(artefact: ChatLabArtefact, value: CatalogueValue): ArtefactPatch | null {
  const kind = artefactCatalogueKind(artefact);
  if (kind === "document") {
    const doc = value as CatalogueValueByKind["document"];
    if (!doc.datasets && !doc.variables && !doc.blocks) return { title: doc.title, content: doc.body };
    const pieces = catalogueToPieces(
      { datasets: doc.datasets ?? [], variables: doc.variables ?? [], blocks: doc.blocks ?? [] },
      artefact.pieces,
    );
    return { title: doc.title, content: doc.body, pieces };
  }
  if (kind === "table") {
    const table = value as CatalogueValueByKind["table"];
    const columns: TableColumn[] = table.columns.map((column, index) => ({
      id: `col-${index}`,
      label: column.label,
      type: column.type ?? "text",
    }));
    const rows = table.rows.map((cells, rowIndex) => ({
      id: `row-${rowIndex}`,
      cells: Object.fromEntries(columns.map((column, index) => [column.id, cells[index] ?? ""])),
    }));
    return { title: table.title, content: serializeMarkdownTable(columns, rows) };
  }
  if (kind === "tracker") {
    const tracker = value as CatalogueValueByKind["tracker"];
    const previous = artefact.shell!.data as TrackerShellData;
    // Ids follow position, so an item keeps its place in the list while it streams.
    const items = tracker.items.map((item, index) => ({
      id: previous.items[index]?.id ?? `item-${index}`,
      label: item.label,
      ...(item.owner ? { owner: item.owner } : {}),
      ...(item.due ? { due: item.due } : {}),
      done: item.done ?? false,
      ...(item.group ? { group: item.group } : {}),
    }));
    const groups = [...new Set([...(tracker.groups ?? []), ...items.flatMap((item) => (item.group ? [item.group] : []))])];
    const data: TrackerShellData = { ...previous, title: tracker.title || previous.title, groups, items };
    return { title: tracker.title, shell: { kind: "tracker", data } as ArtefactShell };
  }
  if (kind === "dashboard") {
    const previous = artefact.shell?.data as AppShellData | undefined;
    const data = catalogueToApp(value as CatalogueValueByKind["dashboard"], previous);
    return { title: data.title, shell: { kind, data } as ArtefactShell };
  }
  if (kind === "guide") {
    const guide = value as CatalogueValueByKind["guide"];
    const previous = artefact.shell!.data as GuideShellData;
    // Ids follow position and what's ticked off is kept, so writing over it doesn't lose their progress.
    const data: GuideShellData = {
      ...previous,
      title: guide.title || previous.title,
      facts: guide.facts.length ? guide.facts : previous.facts,
      needs: guide.needs.map((need, i) => ({ id: previous.needs[i]?.id ?? `need-${i}`, text: need.text, have: previous.needs[i]?.text === need.text ? previous.needs[i]!.have : false, ...(need.group ? { group: need.group } : {}) })),
      steps: guide.steps.map((step, i) => ({ id: previous.steps[i]?.id ?? `step-${i}`, text: step.text, done: previous.steps[i]?.text === step.text ? previous.steps[i]!.done : false, ...(step.minutes ? { minutes: step.minutes } : {}), ...(step.note ? { note: step.note } : {}) })),
    };
    return { title: data.title, shell: { kind: "guide", data } as ArtefactShell };
  }
  if (kind === "schedule") {
    const schedule = value as CatalogueValueByKind["schedule"];
    const previous = artefact.shell!.data as ScheduleShellData;
    const data: ScheduleShellData = {
      ...previous,
      title: schedule.title || previous.title,
      ...(schedule.start ? { start: schedule.start } : {}),
      dayCount: schedule.dayCount,
      hours: [toHours(schedule.hours[0] ?? "09:00"), toHours(schedule.hours[1] ?? "17:00")],
      constraints: schedule.constraints,
      tasks: schedule.tasks.map((task, i) => ({
        id: previous.tasks[i]?.id ?? `task-${i}`,
        label: task.label,
        day: Math.max(0, Math.min(schedule.dayCount - 1, task.day - 1)),
        start: toHours(task.start),
        end: Math.max(toHours(task.start) + 0.25, toHours(task.end)),
        type: task.type,
      })),
    };
    return { title: data.title, shell: { kind: "schedule", data } as ArtefactShell };
  }
  if (kind === "generator") {
    const generator = value as CatalogueValueByKind["generator"];
    const previous = artefact.shell!.data as GeneratorShellData;
    const data: GeneratorShellData = {
      ...previous,
      title: generator.title || previous.title,
      mode: generator.mode,
      controls: {
        ...previous.controls,
        ...(generator.tone ? { tone: generator.tone } : {}),
        ...(generator.length ? { length: generator.length } : {}),
        ...(generator.style ? { style: generator.style } : {}),
        ...(generator.aspect ? { aspect: generator.aspect } : {}),
      },
      ...(generator.variations?.length ? { variations: generator.variations.map((text, i) => ({ id: `v-${i}`, text })) } : {}),
    };
    return { title: data.title, shell: { kind: "generator", data } as ArtefactShell };
  }
  return null;
}

/** What to create when the model fills an interface that isn't open yet. */
export function newCatalogueArtefact(kind: CatalogueKind, title: string): {
  kind: ChatLabArtefactKind;
  libraryKind: string;
  shell?: ArtefactShell;
} {
  if ((SHELL_CATALOGUE as string[]).includes(kind)) {
    const shellKind = kind as "tracker" | "dashboard" | "guide" | "schedule" | "generator";
    return {
      kind: "shell",
      libraryKind: kind === "tracker" ? "checklist" : kind,
      shell: { kind: shellKind, data: { ...structuredClone(EMPTY_SHELL_DATA[shellKind]), title } } as ArtefactShell,
    };
  }
  return { kind: kind as "document" | "table", libraryKind: kind };
}
