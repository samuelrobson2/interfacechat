import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import { defaultValues, parseData } from "./app-query";
import type { AppShellData, Dataset, Row, VariableValue, VariableValues } from "./app-types";

export type DatasetStatus = { state: "ready" | "loading" | "error"; message?: string };

const EMPTY: Row[] = [];

/** Fetches a link's rows. Only links that allow cross-site reads work from here; others need our API. */
export async function fetchRows(url: string, format: "csv" | "json", signal?: AbortSignal): Promise<Row[]> {
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`The link answered ${response.status}`);
  return parseData(await response.text(), format);
}

/**
 * What a Dashboard or Article holds while it's open, beside its spec: the
 * variables' current values, rows fetched from links, and rows code blocks
 * emit. None of it is saved; the spec keeps the last snapshot of each dataset.
 */
export function useAppRuntime(data: AppShellData) {
  const [values, setValues] = useState<VariableValues>(() => defaultValues(data.variables));
  const [emitted, setEmitted] = useState<Record<string, Row[]>>({});
  const [fetched, setFetched] = useState<Record<string, Row[]>>({});
  const [status, setStatus] = useState<Record<string, DatasetStatus>>({});
  const [refreshKey, refresh] = useReducer((n: number) => n + 1, 0);

  // A variable added since opening starts at its default; edits keep what was set.
  const current = useMemo(() => ({ ...defaultValues(data.variables), ...values }), [data.variables, values]);

  const links = data.datasets.filter(
    (dataset): dataset is Dataset & { source: { type: "url"; url: string; format: "csv" | "json" } } =>
      dataset.source.type === "url",
  );
  const linkKey = JSON.stringify(links.map((dataset) => [dataset.id, dataset.source.url, dataset.source.format]));

  // Links are read again on open and on every refresh.
  useEffect(() => {
    if (refreshKey === 0) return; // The spec's snapshot is fresh enough to open with.
    const controller = new AbortController();
    for (const dataset of links) {
      setStatus((s) => ({ ...s, [dataset.id]: { state: "loading" } }));
      fetchRows(dataset.source.url, dataset.source.format, controller.signal)
        .then((rows) => {
          setFetched((f) => ({ ...f, [dataset.id]: rows }));
          setStatus((s) => ({ ...s, [dataset.id]: { state: "ready" } }));
        })
        .catch((error: unknown) => {
          if (controller.signal.aborted) return;
          setStatus((s) => ({
            ...s,
            [dataset.id]: { state: "error", message: error instanceof Error ? error.message : String(error) },
          }));
        });
    }
    return () => controller.abort();
    // `links` is read through linkKey, so a re-render alone doesn't refetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [linkKey, refreshKey]);

  const rowsOf = useCallback(
    (id: string): Row[] => emitted[id] ?? fetched[id] ?? data.datasets.find((dataset) => dataset.id === id)?.rows ?? EMPTY,
    [data.datasets, emitted, fetched],
  );

  return {
    values: current,
    setValue: useCallback((id: string, value: VariableValue) => setValues((v) => ({ ...v, [id]: value })), []),
    rowsOf,
    status,
    emit: useCallback((id: string, rows: Row[]) => setEmitted((e) => ({ ...e, [id]: rows })), []),
    refresh,
    refreshKey,
  };
}

export type AppRuntime = ReturnType<typeof useAppRuntime>;
