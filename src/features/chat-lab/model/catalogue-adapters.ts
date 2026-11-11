import {
  EMPTY_SHELL_DATA,
  serializeMarkdownTable,
  type CatalogueKind,
  type CatalogueValue,
  type CatalogueValueByKind,
  type TableColumn,
  type TrackerShellData,
} from "@/features/interface-shells";
import type { ArtefactShell, ChatLabArtefact, ChatLabArtefactKind } from "./chat-lab-store";
import { artefactDocument, artefactTable } from "./shell-adapters";

/** Which catalogue entry an interface in a thread is, if the model can fill it. */
export function artefactCatalogueKind(artefact: ChatLabArtefact): CatalogueKind | null {
  if (artefact.kind === "document" || artefact.kind === "table") return artefact.kind;
  if (artefact.kind === "shell" && artefact.shell?.kind === "tracker") return "tracker";
  return null;
}

/** An interface's contents in its catalogue shape: what the model reads and patches. */
export function artefactCatalogueValue(artefact: ChatLabArtefact): CatalogueValue | null {
  const kind = artefactCatalogueKind(artefact);
  if (kind === "document") {
    const doc = artefactDocument(artefact);
    return { title: doc.title, body: doc.body };
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
  return null;
}

type ArtefactPatch = { title?: string; content?: string; shell?: ArtefactShell };

/** A catalogue value as a change to the interface that holds it. */
export function catalogueArtefactPatch(artefact: ChatLabArtefact, value: CatalogueValue): ArtefactPatch | null {
  const kind = artefactCatalogueKind(artefact);
  if (kind === "document") {
    const doc = value as CatalogueValueByKind["document"];
    return { title: doc.title, content: doc.body };
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
  return null;
}

/** What to create when the model fills an interface that isn't open yet. */
export function newCatalogueArtefact(kind: CatalogueKind, title: string): {
  kind: ChatLabArtefactKind;
  libraryKind: string;
  shell?: ArtefactShell;
} {
  if (kind === "tracker") {
    return {
      kind: "shell",
      libraryKind: "checklist",
      shell: { kind: "tracker", data: { ...structuredClone(EMPTY_SHELL_DATA.tracker), title } } as ArtefactShell,
    };
  }
  return { kind, libraryKind: kind };
}
