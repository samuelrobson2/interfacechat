import type { AppCatalogueDataset, CatalogueValueByKind } from "../model/shell-catalogue";
import { columnsOf } from "./app-query";
import type { AppShellData, Dataset, Row } from "./app-types";

/** The person's data is shown to the model by its first rows only: enough to read the columns. */
const SHOWN_ROWS = 5;
/** Sample data longer than this is shown in part too. */
const SAMPLE_ROWS = 80;

type AppValue = CatalogueValueByKind["dashboard"];
/** The data, variables and blocks a dashboard or a document carries. */
export type Pieces = Pick<AppShellData, "datasets" | "variables" | "blocks">;
export type DocumentPieces = Pieces;
type CataloguePieces = Pick<AppValue, "datasets" | "variables" | "blocks">;

/** Data the person brought: the model reads it but never writes it. */
const isTheirs = (dataset: Dataset) =>
  dataset.source.type === "upload" ||
  dataset.source.type === "url" ||
  dataset.source.type === "interface" ||
  dataset.source.type === "connector";

function asCells(rows: Row[], columns: string[]) {
  return rows.map((row) => columns.map((column) => row[column] ?? null));
}

/** Data, variables and blocks as the model reads them: its own data in full, the person's by its first rows. */
export function piecesToCatalogue(data: Pieces): CataloguePieces {
  const datasets: AppCatalogueDataset[] = data.datasets.map((dataset) => {
    const columns = columnsOf(dataset.rows).map((column) => column.name);
    const base = { id: dataset.id, label: dataset.label, columns };
    if (dataset.source.type === "code") return { ...base, from: "code", rows: [] };
    const shown = isTheirs(dataset) ? SHOWN_ROWS : SAMPLE_ROWS;
    return {
      ...base,
      from: isTheirs(dataset) ? "yours" : "sample",
      rows: asCells(dataset.rows.slice(0, shown), columns),
      ...(dataset.rows.length > shown ? { rowCount: dataset.rows.length } : {}),
    };
  });
  return { datasets, variables: data.variables, blocks: data.blocks };
}

/** A Dashboard as the model reads it. */
export function appToCatalogue(data: AppShellData): AppValue {
  return { title: data.title, description: data.description || undefined, ...piecesToCatalogue(data) };
}

/**
 * What the model wrote, as the interface holds it. The person's data always
 * stands: a dataset of theirs keeps its rows whatever the model sends, and
 * stays even when a rewrite leaves it out. So does anything shown to the
 * model in part (rowCount set). Only sample data is written from the model's rows.
 */
export function catalogueToPieces(value: CataloguePieces, previous?: Pieces): Pieces {
  const before = new Map(previous?.datasets.map((dataset) => [dataset.id, dataset]) ?? []);
  const datasets: Dataset[] = value.datasets.flatMap((incoming): Dataset[] => {
    const prior = before.get(incoming.id);
    const partial = incoming.rowCount !== undefined && incoming.rows.length < incoming.rowCount;
    if (prior && (isTheirs(prior) || partial)) return [{ ...prior, label: incoming.label || prior.label }];
    // "yours" with nothing behind it would be the model inventing the person's data.
    if (incoming.from === "yours") return [];
    if (incoming.from === "code") {
      const block = value.blocks.find((b) => b.type === "code" && b.output === incoming.id);
      return [
        {
          id: incoming.id,
          label: incoming.label,
          source: { type: "code", blockId: block?.id ?? "" },
          rows: prior?.source.type === "code" ? prior.rows : [],
        },
      ];
    }
    return [
      {
        id: incoming.id,
        label: incoming.label,
        source: { type: "generated", note: "Written by the model" },
        rows: incoming.rows.map((cells) => Object.fromEntries(incoming.columns.map((column, index) => [column, cells[index] ?? null]))),
      },
    ];
  });
  for (const prior of previous?.datasets ?? []) {
    if (isTheirs(prior) && !datasets.some((dataset) => dataset.id === prior.id)) datasets.push(prior);
  }
  return { datasets, variables: value.variables, blocks: value.blocks };
}

/** A Dashboard the model wrote, as the interface holds it. */
export function catalogueToApp(value: AppValue, previous?: AppShellData): AppShellData {
  return {
    ...(previous?.project ? { project: previous.project } : {}),
    title: value.title || previous?.title || "",
    description: value.description ?? previous?.description ?? "",
    ...catalogueToPieces(value, previous),
  };
}
