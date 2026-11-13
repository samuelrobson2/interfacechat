import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/shared/lib/css";
import type { Row, VariableValues } from "./app-types";

/**
 * Runs a code block's JavaScript where it can't touch the app.
 *
 * - `sandbox="allow-scripts"` without `allow-same-origin` gives the frame a
 *   null origin: no cookies, storage or DOM of ours, and no credentialed calls
 *   to our API.
 * - Its own CSP has `default-src 'none'`, so no fetch, no images or scripts
 *   from anywhere: data only comes in by message, and only rows go out.
 *
 * The code gets `data` (its inputs by dataset id), `vars`, `root` to draw into
 * and `emit(rows)`, and runs again whenever any of them changes.
 */

const FRAME_CSP =
  "default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval'; style-src 'unsafe-inline'; img-src data: blob:; font-src data:";

const FRAME = `<!doctype html><html><head><meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="${FRAME_CSP}">
<style>
html,body{margin:0;background:transparent;color:#1a1718;font:13px/1.45 ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif}
#root{min-height:1px}
table{border-collapse:collapse;width:100%}td,th{padding:4px 8px;border-bottom:1px solid #eee;text-align:left}
</style></head><body><div id="root"></div><script>
const root = document.getElementById("root");
const send = (message) => parent.postMessage(message, "*");
const report = () => send({ type: "height", height: Math.ceil(document.body.scrollHeight) });
let run = 0;
const RESERVED = "break case catch class const continue debugger default delete do else enum export extends false finally for function if import in instanceof let new null return static super switch this throw true try typeof var void while with yield await arguments eval".split(" ");
window.addEventListener("message", (event) => {
  if (event.source !== parent || !event.data || event.data.type !== "run") return;
  const { code, data, vars } = event.data;
  const mine = ++run;
  root.innerHTML = "";
  const emit = (rows) => { if (mine === run) send({ type: "emit", rows: JSON.parse(JSON.stringify(rows ?? [])) }); };
  const fail = (error) => send({ type: "error", message: String((error && error.message) || error) });
  try {
    // Each input and variable is also a name of its own, so sales works as well as data.sales.
    const taken = new Set(["data", "vars", "root", "emit", ...RESERVED]);
    const named = [...Object.entries(data), ...Object.entries(vars)].filter(([name]) => /^[A-Za-z_$][\\w$]*$/.test(name) && !taken.has(name) && taken.add(name));
    const body = new Function("data", "vars", "root", "emit", ...named.map(([name]) => name), '"use strict";\\n' + code);
    const result = body(data, vars, root, emit, ...named.map(([, value]) => value));
    Promise.resolve(result).then(() => { if (mine === run) { send({ type: "done" }); report(); } }, fail);
  } catch (error) { fail(error); }
  report();
});
window.addEventListener("error", (event) => send({ type: "error", message: event.message }));
new ResizeObserver(report).observe(document.body);
send({ type: "ready" });
</script></body></html>`;

/** Each rows array gets a number, so a rerun can tell new data from a re-render. */
const ids = new WeakMap<object, number>();
let nextId = 1;
const idOf = (rows: Row[]) => {
  if (!ids.has(rows)) ids.set(rows, nextId++);
  return ids.get(rows)!;
};

export type SandboxStatus = { state: "running" | "done" | "error"; message?: string };

export function CodeSandbox({
  source,
  inputs,
  vars,
  runKey,
  onEmit,
  onStatus,
  maxHeight = 480,
  className,
}: {
  source: string;
  inputs: Record<string, Row[]>;
  vars: VariableValues;
  /** Bump to run again with nothing changed. */
  runKey: number;
  onEmit?: (rows: Row[]) => void;
  onStatus?: (status: SandboxStatus) => void;
  maxHeight?: number;
  className?: string;
}) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [ready, setReady] = useState(false);
  const [height, setHeight] = useState(0);
  const latest = useRef({ onEmit, onStatus });
  useEffect(() => {
    latest.current = { onEmit, onStatus };
  });

  // What the run depends on, cheaply: rows by identity, variables by value.
  const signature = useMemo(
    () =>
      JSON.stringify([
        source,
        runKey,
        Object.entries(inputs).map(([id, rows]) => [id, idOf(rows)]),
        vars,
      ]),
    [source, runKey, inputs, vars],
  );
  const payload = useRef({ source, inputs, vars });
  useEffect(() => {
    payload.current = { source, inputs, vars };
  });

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.source !== frame.current?.contentWindow) return;
      const message = event.data as { type: string; height?: number; rows?: Row[]; message?: string };
      if (message.type === "ready") setReady(true);
      else if (message.type === "height") setHeight(Math.min(maxHeight, message.height ?? 0));
      else if (message.type === "emit") latest.current.onEmit?.(message.rows ?? []);
      else if (message.type === "done") latest.current.onStatus?.({ state: "done" });
      else if (message.type === "error") latest.current.onStatus?.({ state: "error", message: message.message });
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [maxHeight]);

  useEffect(() => {
    if (!ready) return;
    // Typing in the code waits for a pause before it runs.
    const timer = window.setTimeout(() => {
      const { source: code, inputs: data, vars: values } = payload.current;
      latest.current.onStatus?.({ state: "running" });
      frame.current?.contentWindow?.postMessage({ type: "run", code, data, vars: values }, "*");
    }, 250);
    return () => window.clearTimeout(timer);
  }, [ready, signature]);

  return (
    <iframe
      ref={frame}
      title="Code output"
      sandbox="allow-scripts"
      srcDoc={FRAME}
      className={cn("block w-full border-0 bg-transparent", className)}
      style={{ height }}
    />
  );
}
