import {
  Check,
  CircleAlert,
  CircleDashed,
  CircleSlash,
  Loader2,
  MousePointerSquareDashed,
  Play,
  RotateCcw,
  Square,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/shared/lib/css";

/**
 * Dev-only overlay for the states page: select parts of any interface, write a
 * prompt, and Claude Code edits the source through the dev server's
 * /__dev-edit endpoint (vite-plugins/dev-edit.ts). HMR shows the result.
 *
 * Edits stack: sending while one runs adds to a queue. Each keeps its own
 * prompt and selections, and they run in order in one Claude session.
 *
 * Stages mark themselves with data-edit-kind / -size / -state; anything inside
 * one can be selected.
 */

const STAGE_SELECTOR = "[data-edit-kind]";
const OVERLAY_ATTR = "data-edit-overlay";
const MAX_HTML = 1500;
const MAX_TEXT = 200;
/** Components that frame a stage rather than belong to the interface. */
const FRAME_COMPONENTS = new Set(["ShellMorph", "Stage", "StatesRow", "InterfaceStatesPage"]);

type Selection = {
  id: string;
  element: HTMLElement;
  label: string;
  payload: {
    interface: string;
    size: string;
    state: string;
    components: string[];
    path: string;
    tag: string;
    text: string;
    html: string;
  };
};

type LogLine = { id: number; kind: "text" | "tool" | "done" | "error"; text: string };

type EditEvent =
  | { kind: "session"; id: string }
  | { kind: "text"; text: string }
  | { kind: "tool"; name: string; detail: string }
  | { kind: "done"; result: string }
  | { kind: "error"; message: string };

const clip = (value: string, max: number) => (value.length > max ? `${value.slice(0, max)}…` : value);

/** Names of the React components that rendered this element, innermost first. */
function componentNames(element: HTMLElement): string[] {
  const key = Object.keys(element).find((name) => name.startsWith("__reactFiber$"));
  type Fiber = { type: unknown; return: Fiber | null };
  let fiber = key ? ((element as unknown as Record<string, Fiber>)[key] ?? null) : null;
  const names: string[] = [];
  while (fiber && names.length < 6) {
    const type = fiber.type as
      | ((...args: unknown[]) => unknown) & { displayName?: string }
      | { render?: { name?: string }; type?: { name?: string }; displayName?: string }
      | string
      | null;
    let name: string | undefined;
    if (typeof type === "function") name = type.displayName || type.name;
    else if (type && typeof type === "object") name = type.displayName || type.render?.name || type.type?.name;
    if (name === "Stage") break;
    if (name && !FRAME_COMPONENTS.has(name) && !names.includes(name)) names.push(name);
    fiber = fiber.return;
  }
  return names;
}

/** A CSS-ish path from the stage down to the element. */
function pathFrom(stage: HTMLElement, element: HTMLElement) {
  const segments: string[] = [];
  let node: HTMLElement | null = element;
  while (node && node !== stage) {
    const parent: HTMLElement | null = node.parentElement;
    const index = parent ? Array.from(parent.children).indexOf(node) + 1 : 1;
    segments.unshift(`${node.tagName.toLowerCase()}:nth-child(${index})`);
    node = parent;
  }
  return segments.join(" > ");
}

function describe(element: HTMLElement, stage: HTMLElement): Selection {
  const { editKind = "", editSize = "", editState = "", editLabel = "" } = stage.dataset;
  const whole = element === stage;
  const text = clip((element.innerText || element.getAttribute("aria-label") || "").replace(/\s+/g, " ").trim(), MAX_TEXT);
  const tag = element.tagName.toLowerCase();
  const components = componentNames(element);
  const what = whole ? "whole interface" : components[0] ?? (text ? `“${clip(text, 24)}”` : `<${tag}>`);
  return {
    id: `${editKind}-${editSize}-${editState}-${Math.random().toString(36).slice(2, 8)}`,
    element,
    label: `${editLabel} · ${what}`,
    payload: {
      interface: editKind,
      size: editSize,
      state: editState,
      components,
      path: whole ? "" : pathFrom(stage, element),
      tag,
      text,
      html: clip(element.outerHTML, MAX_HTML),
    },
  };
}

/** An outline that follows an element as the page scrolls or reflows. */
function Outline({ element, tone }: { element: HTMLElement | null; tone: "hover" | "selected" }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let frame = 0;
    const tick = () => {
      const box = ref.current;
      if (box) {
        if (element?.isConnected) {
          const rect = element.getBoundingClientRect();
          box.style.display = "block";
          box.style.transform = `translate(${rect.left - 2}px, ${rect.top - 2}px)`;
          box.style.width = `${rect.width + 4}px`;
          box.style.height = `${rect.height + 4}px`;
        } else {
          box.style.display = "none";
        }
      }
      frame = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(frame);
  }, [element]);
  return (
    <div
      ref={ref}
      aria-hidden
      className={cn(
        "pointer-events-none fixed top-0 left-0 z-40 rounded-[6px] border",
        tone === "hover" ? "border-dashed border-blue-4 bg-blue-1/30" : "border-blue-5 bg-blue-1/40",
      )}
    />
  );
}

type EditStatus = "queued" | "running" | "done" | "error" | "stopped";

type QueuedEdit = {
  id: number;
  prompt: string;
  /** Captured when queued: the page may hot-reload before this edit runs. */
  selections: Array<Pick<Selection, "label" | "payload">>;
  status: EditStatus;
  log: LogLine[];
};

const STATUS_ICON: Record<EditStatus, React.ReactNode> = {
  queued: <CircleDashed className="size-3.5 text-typography-secondary" />,
  running: <Loader2 className="size-3.5 animate-spin text-blue-4" />,
  done: <Check className="size-3.5 text-green-5" />,
  error: <CircleAlert className="size-3.5 text-red-5" />,
  stopped: <CircleSlash className="size-3.5 text-typography-secondary" />,
};

/** Streams one edit from the dev server, reporting each event as it lands. */
async function streamEdit(
  body: { prompt: string; page: string; selections: Selection["payload"][]; sessionId?: string },
  signal: AbortSignal,
  onEvent: (event: EditEvent) => void,
) {
  const response = await fetch("/__dev-edit", {
    method: "POST",
    headers: { "content-type": "application/json" },
    signal,
    body: JSON.stringify(body),
  });
  if (!response.ok || !response.body) {
    onEvent({ kind: "error", message: (await response.text()) || `Request failed (${response.status})` });
    return;
  }
  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += value;
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (line.trim()) onEvent(JSON.parse(line) as EditEvent);
    }
  }
}

function LogView({ lines }: { lines: LogLine[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.scrollTo({ top: ref.current.scrollHeight });
  }, [lines]);
  if (lines.length === 0) return null;
  return (
    <div ref={ref} className="mt-1 max-h-32 overflow-y-auto rounded-[10px] bg-gray-0 px-2.5 py-1.5 text-[12px] leading-relaxed">
      {lines.map((line) => (
        <p
          key={line.id}
          className={cn(
            "whitespace-pre-wrap",
            line.kind === "tool" && "text-typography-secondary",
            line.kind === "error" && "text-red-5",
            line.kind === "done" && "text-green-5",
          )}
        >
          {line.kind === "tool" ? `→ ${line.text}` : line.text}
        </p>
      ))}
    </div>
  );
}

export function EditOverlay() {
  const [selecting, setSelecting] = useState(false);
  const [hovered, setHovered] = useState<HTMLElement | null>(null);
  const [selections, setSelections] = useState<Selection[]>([]);
  const [prompt, setPrompt] = useState("");
  const [queue, setQueue] = useState<QueuedEdit[]>([]);
  const [paused, setPaused] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [sessionId, setSessionId] = useState<string | undefined>();
  // The runner reads these between edits, outside React's render.
  const sessionRef = useRef<string | undefined>(undefined);
  const activeRef = useRef<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const nextId = useRef(0);

  // While selecting, the page is a picker: hover outlines, click selects.
  useEffect(() => {
    if (!selecting) return;
    const targetOf = (event: Event) => {
      const target = event.target as HTMLElement | null;
      if (!target || target.closest(`[${OVERLAY_ATTR}]`)) return null;
      const stage = target.closest<HTMLElement>(STAGE_SELECTOR);
      return stage ? { target, stage } : null;
    };
    const onMove = (event: PointerEvent) => {
      const hit = targetOf(event);
      setHovered(hit ? (event.altKey ? hit.stage : hit.target) : null);
    };
    const block = (event: Event) => {
      if (!targetOf(event)) return;
      event.preventDefault();
      event.stopPropagation();
    };
    const onClick = (event: MouseEvent) => {
      const hit = targetOf(event);
      if (!hit) return;
      event.preventDefault();
      event.stopPropagation();
      const element = event.altKey ? hit.stage : hit.target;
      setSelections((current) =>
        current.some((item) => item.element === element)
          ? current.filter((item) => item.element !== element)
          : [...current, describe(element, hit.stage)],
      );
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelecting(false);
    };
    document.addEventListener("pointermove", onMove, true);
    document.addEventListener("pointerdown", block, true);
    document.addEventListener("mousedown", block, true);
    document.addEventListener("click", onClick, true);
    document.addEventListener("keydown", onKey);
    document.body.style.cursor = "crosshair";
    return () => {
      document.removeEventListener("pointermove", onMove, true);
      document.removeEventListener("pointerdown", block, true);
      document.removeEventListener("mousedown", block, true);
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("keydown", onKey);
      document.body.style.cursor = "";
      setHovered(null);
    };
  }, [selecting]);

  const update = (id: number, change: (item: QueuedEdit) => QueuedEdit) =>
    setQueue((current) => current.map((item) => (item.id === id ? change(item) : item)));

  const run = async (edit: QueuedEdit) => {
    activeRef.current = edit.id;
    setExpanded(edit.id);
    update(edit.id, (item) => ({ ...item, status: "running", log: [] }));
    const controller = new AbortController();
    abortRef.current = controller;
    let lineId = 0;
    let status = "error" as EditStatus;
    const push = (kind: LogLine["kind"], text: string) =>
      update(edit.id, (item) => ({ ...item, log: [...item.log, { id: ++lineId, kind, text }] }));

    try {
      await streamEdit(
        {
          prompt: edit.prompt,
          page: window.location.pathname,
          selections: edit.selections.map((item) => item.payload),
          sessionId: sessionRef.current,
        },
        controller.signal,
        (event) => {
          if (event.kind === "session") {
            sessionRef.current = event.id;
            setSessionId(event.id);
          } else if (event.kind === "text") push("text", event.text);
          else if (event.kind === "tool") push("tool", `${event.name} ${event.detail.split("/").slice(-2).join("/")}`);
          else if (event.kind === "error") push("error", event.message);
          else if (event.kind === "done") status = "done";
        },
      );
    } catch (error) {
      if (controller.signal.aborted) status = "stopped";
      else push("error", String(error));
    }

    abortRef.current = null;
    activeRef.current = null;
    update(edit.id, (item) => ({ ...item, status }));
    // A stop or a failure pauses the stack, so later edits don't build on a bad state.
    if (status !== "done") setPaused(true);
    else setExpanded((open) => (open === edit.id ? null : open));
  };

  // The runner: whenever nothing is running, start the next queued edit.
  const next = queue.find((item) => item.status === "queued");
  const busy = queue.some((item) => item.status === "running");
  useEffect(() => {
    if (paused || busy || !next || activeRef.current !== null) return;
    void run(next);
    // `run` only touches refs and setters; re-running on its identity would double-start.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused, busy, next?.id]);

  const add = () => {
    if (!prompt.trim()) return;
    setQueue((current) => [
      ...current,
      {
        id: ++nextId.current,
        prompt: prompt.trim(),
        selections: selections.map(({ label, payload }) => ({ label, payload })),
        status: "queued",
        log: [],
      },
    ]);
    setPrompt("");
    setSelections([]);
    setSelecting(false);
  };

  const removeSelection = (id: string) => setSelections((current) => current.filter((item) => item.id !== id));
  const removeEdit = (id: number) => setQueue((current) => current.filter((item) => item.id !== id));
  const retry = (id: number) => {
    update(id, (item) => ({ ...item, status: "queued", log: [] }));
    setPaused(false);
  };
  const clearFinished = () =>
    setQueue((current) => current.filter((item) => item.status === "queued" || item.status === "running"));
  const newSession = () => {
    sessionRef.current = undefined;
    setSessionId(undefined);
  };

  const waiting = queue.filter((item) => item.status === "queued").length;
  const finished = queue.some((item) => item.status !== "queued" && item.status !== "running");

  return (
    <>
      {selecting && hovered && <Outline element={hovered} tone="hover" />}
      {selections.map((item) => (
        <Outline key={item.id} element={item.element} tone="selected" />
      ))}

      <div
        {...{ [OVERLAY_ATTR]: "" }}
        className="fixed bottom-6 left-1/2 z-50 flex w-[min(620px,calc(100vw-32px))] -translate-x-1/2 flex-col gap-2 rounded-[20px] border border-gray-3/20 bg-gray-0/95 p-3 font-bureau shadow-[0_12px_40px_-12px_rgba(26,23,24,0.25)] backdrop-blur-md"
      >
        {queue.length > 0 && (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 px-1 text-[12px] text-typography-secondary">
              <span>
                {queue.length} {queue.length === 1 ? "edit" : "edits"}
                {waiting > 0 && ` · ${waiting} waiting`}
                {paused && waiting > 0 && " · paused"}
              </span>
              {paused && waiting > 0 && !busy && (
                <button
                  type="button"
                  onClick={() => setPaused(false)}
                  className="flex items-center gap-1 rounded-full px-2 py-0.5 text-typography-primary hover:bg-gray-6"
                >
                  <Play className="size-3" />
                  Resume
                </button>
              )}
              {finished && (
                <button type="button" onClick={clearFinished} className="ml-auto rounded-full px-2 py-0.5 hover:bg-gray-6">
                  Clear finished
                </button>
              )}
            </div>
            <ol className="flex max-h-64 flex-col gap-1 overflow-y-auto">
              {queue.map((edit, index) => (
                <li key={edit.id} className="rounded-[12px] bg-gray-6 px-2.5 py-1.5">
                  <div className="flex items-center gap-2 text-[13px]">
                    <span className="shrink-0">{STATUS_ICON[edit.status]}</span>
                    <button
                      type="button"
                      onClick={() => setExpanded((open) => (open === edit.id ? null : edit.id))}
                      title={edit.prompt}
                      className="min-w-0 flex-1 truncate text-left text-typography-primary"
                    >
                      <span className="text-typography-secondary">{index + 1}.</span> {edit.prompt}
                    </button>
                    {edit.selections.length > 0 && (
                      <span className="shrink-0 rounded-full bg-blue-1 px-2 text-[11px] text-blue-6">
                        {edit.selections.length} selected
                      </span>
                    )}
                    {edit.status === "running" && (
                      <button
                        type="button"
                        onClick={() => abortRef.current?.abort()}
                        aria-label="Stop this edit"
                        className="grid size-5 shrink-0 place-items-center rounded-full hover:bg-gray-0"
                      >
                        <Square className="size-2.5 fill-current" />
                      </button>
                    )}
                    {(edit.status === "error" || edit.status === "stopped") && (
                      <button
                        type="button"
                        onClick={() => retry(edit.id)}
                        aria-label="Run this edit again"
                        className="grid size-5 shrink-0 place-items-center rounded-full hover:bg-gray-0"
                      >
                        <RotateCcw className="size-3" />
                      </button>
                    )}
                    {edit.status !== "running" && (
                      <button
                        type="button"
                        onClick={() => removeEdit(edit.id)}
                        aria-label="Remove this edit"
                        className="grid size-5 shrink-0 place-items-center rounded-full hover:bg-gray-0"
                      >
                        <X className="size-3" />
                      </button>
                    )}
                  </div>
                  {expanded === edit.id && (
                    <>
                      {edit.selections.length > 0 && (
                        <p className="mt-1 text-[11px] text-typography-secondary">
                          {edit.selections.map((item) => item.label).join(" · ")}
                        </p>
                      )}
                      <LogView lines={edit.log} />
                    </>
                  )}
                </li>
              ))}
            </ol>
          </div>
        )}

        {selections.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {selections.map((item) => (
              <span
                key={item.id}
                className="flex items-center gap-1 rounded-full bg-blue-1 py-0.5 pr-1 pl-2.5 text-[12px] text-blue-6"
              >
                {item.label}
                <button
                  type="button"
                  onClick={() => removeSelection(item.id)}
                  aria-label={`Remove ${item.label}`}
                  className="grid size-4 place-items-center rounded-full hover:bg-blue-2"
                >
                  <X className="size-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        <textarea
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
              event.preventDefault();
              add();
            }
          }}
          rows={2}
          placeholder={
            selections.length
              ? "What should change about the selected parts?"
              : "Select parts of an interface, then describe the change"
          }
          className="w-full resize-none bg-transparent px-1 text-[14px] text-typography-primary outline-none placeholder:text-typography-secondary"
        />

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSelecting((value) => !value)}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] transition-colors active:scale-[0.97]",
              selecting ? "bg-blue-4 text-gray-0" : "bg-gray-6 text-typography-primary hover:bg-blue-1",
            )}
          >
            <MousePointerSquareDashed className="size-3.5" />
            {selecting ? "Selecting · Esc to stop" : "Select"}
          </button>
          {sessionId && !busy && waiting === 0 && (
            <button
              type="button"
              onClick={newSession}
              title="Start the next edit in a new Claude session instead of following up"
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] text-typography-secondary hover:bg-gray-6"
            >
              <RotateCcw className="size-3.5" />
              New session
            </button>
          )}
          <span className="ml-auto hidden text-[12px] text-typography-secondary sm:block">
            {selecting ? "Click to select · ⌥ for the whole interface" : "⌘↵ to send"}
          </span>
          <button
            type="button"
            onClick={add}
            disabled={!prompt.trim()}
            className="rounded-full bg-gray-5 px-4 py-1.5 text-[13px] text-gray-0 transition-opacity active:scale-[0.97] disabled:opacity-30"
          >
            {busy || waiting > 0 ? "Add to queue" : "Send"}
          </button>
        </div>
      </div>
    </>
  );
}
