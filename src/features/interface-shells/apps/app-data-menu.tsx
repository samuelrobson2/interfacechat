import { Database, FileUp, Link2, Loader2, Plug, RefreshCw, Trash2, TriangleAlert } from "lucide-react";
import { createContext, useContext, useRef, useState } from "react";
import { cn } from "@/shared/lib/css";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/kit/popover";
import { fieldEvents, stopFieldEvent } from "../ui/shell-surface";
import { columnsOf, datasetId, MAX_ROWS, parseData } from "./app-query";
import type { AppShellData, Dataset, DataSource, Row } from "./app-types";
import { fetchRows, type AppRuntime } from "./use-app-runtime";

/** Data another interface in the same chat can lend, such as a Table's rows. */
export type LinkableData = { id: string; label: string; kind: string; rows: Row[] };

/**
 * What the host can lend, set around wherever its apps are drawn. A context
 * rather than a prop, so a Dashboard or Article drawn by InterfaceShell gets
 * it too.
 */
export const LinkableDataContext = createContext<LinkableData[]>([]);

const SOURCE_LABEL: Record<DataSource["type"], string> = {
  generated: "Sample",
  upload: "Uploaded",
  url: "Link",
  interface: "Linked",
  code: "From code",
  connector: "Connected",
};

/** Sample data is marked loudly: it's the model's numbers, not anyone's real ones. */
function SourceBadge({ source }: { source: DataSource }) {
  return (
    <span
      className={cn(
        "rounded-full px-1.5 py-px font-bureau text-[10px] uppercase tracking-[0.4px]",
        source.type === "generated" ? "bg-[#fff1d6] text-[#8a5a00]" : "bg-gray-6 text-typography-secondary",
      )}
    >
      {SOURCE_LABEL[source.type]}
    </span>
  );
}

const formatOf = (name: string, type?: string): "csv" | "json" =>
  /\.json($|\?)/i.test(name) || type?.includes("json") ? "json" : "csv";

/**
 * Where an app's data comes from, and the ways to bring more: a file, a link,
 * another interface's data. Replacing a dataset keeps its id, so the blocks
 * reading it carry on when the columns match.
 */
export function AppDataMenu({
  data,
  runtime,
  onChange,
  linkable: given,
}: {
  data: AppShellData;
  runtime: AppRuntime;
  onChange?: (data: AppShellData) => void;
  linkable?: LinkableData[];
}) {
  const lent = useContext(LinkableDataContext);
  const linkable = given ?? lent;
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const file = useRef<HTMLInputElement>(null);
  const replacing = useRef<string | null>(null);
  const ids = data.datasets.map((dataset) => dataset.id);

  const put = (dataset: Dataset) => {
    const exists = data.datasets.some((d) => d.id === dataset.id);
    onChange?.({
      ...data,
      datasets: exists ? data.datasets.map((d) => (d.id === dataset.id ? dataset : d)) : [...data.datasets, dataset],
    });
  };

  const onFile = async (picked: File | undefined) => {
    if (!picked) return;
    setError(null);
    try {
      const rows = parseData(await picked.text(), formatOf(picked.name, picked.type));
      if (!rows.length) throw new Error("Couldn't find rows in that file. CSV, TSV or a JSON list of objects works.");
      const id = replacing.current ?? datasetId(picked.name, ids);
      const label = data.datasets.find((d) => d.id === id)?.label ?? picked.name.replace(/\.[a-z]+$/i, "");
      put({ id, label, source: { type: "upload", fileName: picked.name, addedAt: new Date().toISOString() }, rows });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      replacing.current = null;
    }
  };

  const addLink = async () => {
    const link = url.trim();
    if (!link) return;
    setBusy(true);
    setError(null);
    try {
      const format = formatOf(link);
      const rows = await fetchRows(link, format);
      if (!rows.length) throw new Error("The link answered, but without rows.");
      const name = new URL(link).pathname.split("/").filter(Boolean).pop() ?? new URL(link).hostname;
      put({ id: datasetId(name, ids), label: name.replace(/\.[a-z]+$/i, ""), source: { type: "url", url: link, format }, rows });
      setUrl("");
    } catch (err) {
      // A cross-site read the other server doesn't allow fails without a reason; say what to do.
      setError(
        err instanceof TypeError
          ? "That site doesn't let other sites read it. Download it and upload the file, or use a published CSV link."
          : err instanceof Error
            ? err.message
            : String(err),
      );
    } finally {
      setBusy(false);
    }
  };

  const generated = data.datasets.filter((dataset) => dataset.source.type === "generated").length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          {...fieldEvents}
          className="flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-[8px] px-2 font-bureau text-[13px] text-typography-secondary transition-colors hover:bg-gray-6 hover:text-typography-primary data-[state=open]:bg-gray-6 data-[state=open]:text-typography-primary"
        >
          <Database className="size-4" />
          Data
          <span className="tabular-nums text-typography-secondary">{data.datasets.length}</span>
          {generated > 0 && <span aria-label="Has sample data" className="size-1.5 rounded-full bg-[#e0a21a]" />}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={6}
        onPointerDown={stopFieldEvent}
        className="w-[380px] rounded-[16px] border-gray-3/20 bg-background-primary p-0 shadow-elevated"
      >
        <div className="flex flex-col">
          <div className="flex items-center justify-between px-4 pt-3.5 pb-2">
            <span className="font-bureau text-[14px] text-typography-primary">Data</span>
            <button
              type="button"
              onClick={() => runtime.refresh()}
              className="flex cursor-pointer items-center gap-1 rounded-[6px] px-1.5 py-1 font-bureau text-[12px] text-typography-secondary hover:bg-gray-6"
            >
              <RefreshCw className="size-3" />
              Refresh
            </button>
          </div>

          <ul className="flex max-h-64 flex-col overflow-y-auto px-2">
            {data.datasets.length === 0 && (
              <li className="px-2 py-3 font-bureau text-[13px] text-typography-secondary">
                No data yet. Add a file or a link, or ask for sample numbers to start.
              </li>
            )}
            {data.datasets.map((dataset) => {
              const rows = runtime.rowsOf(dataset.id);
              const status = runtime.status[dataset.id];
              return (
                <li key={dataset.id} className="group flex items-start gap-2 rounded-[10px] px-2 py-2 hover:bg-gray-6/60">
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="flex items-center gap-1.5">
                      <span className="truncate font-bureau text-[13px] text-typography-primary">{dataset.label}</span>
                      <SourceBadge source={dataset.source} />
                      {status?.state === "loading" && <Loader2 className="size-3 animate-spin text-typography-secondary" />}
                    </span>
                    <span className="truncate font-bureau text-[11px] text-typography-secondary tabular-nums">
                      {dataset.id} · {rows.length} rows · {columnsOf(rows).length} columns
                      {dataset.source.type === "url" && ` · ${new URL(dataset.source.url).hostname}`}
                      {dataset.source.type === "upload" && ` · ${dataset.source.fileName}`}
                    </span>
                    {status?.state === "error" && (
                      <span className="flex items-center gap-1 font-bureau text-[11px] text-red-5">
                        <TriangleAlert className="size-3" />
                        {status.message}
                      </span>
                    )}
                  </div>
                  {onChange && dataset.source.type !== "code" && (
                    <button
                      type="button"
                      onClick={() => {
                        replacing.current = dataset.id;
                        file.current?.click();
                      }}
                      className="cursor-pointer rounded-[6px] px-1.5 py-0.5 font-bureau text-[12px] text-typography-secondary opacity-0 group-hover:opacity-100 hover:bg-gray-6 hover:text-typography-primary"
                    >
                      Replace
                    </button>
                  )}
                  {onChange && (
                    <button
                      type="button"
                      aria-label={`Remove ${dataset.label}`}
                      onClick={() => onChange({ ...data, datasets: data.datasets.filter((d) => d.id !== dataset.id) })}
                      className="grid size-6 cursor-pointer place-items-center rounded-[6px] text-typography-secondary opacity-0 group-hover:opacity-100 hover:bg-gray-6"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
          {generated > 0 && (
            <p className="mx-4 mt-1 rounded-[8px] bg-[#fff8e8] px-2.5 py-2 font-bureau text-[11px] leading-[1.45] text-[#7a5200]">
              Sample data is numbers the model wrote. Replace it with yours; blocks keep working when the column names match.
            </p>
          )}

          {onChange && (
            <div className="mt-2 flex flex-col gap-1 border-t border-gray-3/15 p-2">
              <button
                type="button"
                onClick={() => file.current?.click()}
                className="flex cursor-pointer items-center gap-2 rounded-[8px] px-2 py-1.5 font-bureau text-[13px] text-typography-primary hover:bg-gray-6"
              >
                <FileUp className="size-4 text-typography-secondary" />
                Upload a file
                <span className="ml-auto text-[11px] text-typography-secondary">CSV, TSV, JSON · up to {MAX_ROWS.toLocaleString()} rows</span>
              </button>
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  void addLink();
                }}
                className="flex items-center gap-2 rounded-[8px] px-2 py-1"
              >
                <Link2 className="size-4 shrink-0 text-typography-secondary" />
                <input
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  placeholder="Paste a CSV or JSON link"
                  className="min-w-0 flex-1 bg-transparent font-bureau text-[13px] text-typography-primary outline-none placeholder:text-typography-secondary"
                />
                <button
                  type="submit"
                  disabled={!url.trim() || busy}
                  className="cursor-pointer rounded-[6px] bg-gray-6 px-2 py-0.5 font-bureau text-[12px] text-typography-primary disabled:opacity-40"
                >
                  {busy ? "Adding…" : "Add"}
                </button>
              </form>
              {linkable.map((source) => (
                <button
                  key={source.id}
                  type="button"
                  onClick={() =>
                    put({
                      id: datasetId(source.label, ids),
                      label: source.label,
                      source: { type: "interface", kind: source.kind, title: source.label },
                      rows: source.rows,
                    })
                  }
                  className="flex cursor-pointer items-center gap-2 rounded-[8px] px-2 py-1.5 font-bureau text-[13px] text-typography-primary hover:bg-gray-6"
                >
                  <Database className="size-4 text-typography-secondary" />
                  Use {source.label}
                  <span className="ml-auto text-[11px] text-typography-secondary">{source.rows.length} rows</span>
                </button>
              ))}
              <div className="flex items-center gap-2 rounded-[8px] px-2 py-1.5 font-bureau text-[13px] text-typography-secondary">
                <Plug className="size-4" />
                Connect Google Sheets, a database…
                <span className="ml-auto rounded-full bg-gray-6 px-1.5 py-px text-[10px] uppercase tracking-[0.4px]">Next</span>
              </div>
              {error && (
                <p role="alert" className="mx-2 mb-1 font-bureau text-[12px] text-red-5">
                  {error}
                </p>
              )}
            </div>
          )}
          <input
            ref={file}
            type="file"
            accept=".csv,.tsv,.json,text/csv,application/json"
            className="hidden"
            onChange={(event) => {
              void onFile(event.target.files?.[0]);
              event.target.value = "";
            }}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
