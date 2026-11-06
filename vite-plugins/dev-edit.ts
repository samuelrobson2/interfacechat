import { spawn, type ChildProcess } from "node:child_process";
import type { IncomingMessage, ServerResponse } from "node:http";
import type { Plugin, ViteDevServer } from "vite";

/**
 * Dev-only: POST /__dev-edit runs Claude Code headless in this repo with a
 * prompt and the parts of the page the person selected, then streams its
 * progress back as NDJSON. Vite's HMR shows the edit when it lands.
 *
 * The dev server listens on the network and accepts tunnel hosts, so this only
 * answers loopback requests addressed to localhost. Claude may read and edit
 * files, never run commands.
 */

type Selection = {
  interface: string;
  size: string;
  state: string;
  components: string[];
  path: string;
  tag: string;
  text: string;
  html: string;
};

type EditRequest = {
  prompt: string;
  page: string;
  selections: Selection[];
  sessionId?: string;
};

export type EditEvent =
  | { kind: "session"; id: string }
  | { kind: "text"; text: string }
  | { kind: "tool"; name: string; detail: string }
  | { kind: "done"; result: string }
  | { kind: "error"; message: string };

const MAX_BODY = 200_000;
const ALLOWED_TOOLS = ["Read", "Edit", "Write", "Glob", "Grep"];
const LOOPBACK = new Set(["127.0.0.1", "::1", "::ffff:127.0.0.1"]);
const LOCAL_HOST = /^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/;

let running: ChildProcess | null = null;

function isLocal(req: IncomingMessage) {
  const remote = req.socket.remoteAddress ?? "";
  const host = req.headers.host ?? "";
  const origin = req.headers.origin;
  const originHost = origin ? origin.replace(/^https?:\/\//, "") : host;
  return LOOPBACK.has(remote) && LOCAL_HOST.test(host) && LOCAL_HOST.test(originHost);
}

function describe(selection: Selection, index: number) {
  return [
    `${index + 1}. ${selection.interface} interface, size "${selection.size}", state "${selection.state}"`,
    selection.components.length ? `   React components (innermost first): ${selection.components.join(" < ")}` : "",
    `   Element: <${selection.tag}> at ${selection.path || "(the whole interface)"}`,
    selection.text ? `   Text: ${JSON.stringify(selection.text)}` : "",
    `   HTML: ${selection.html}`,
  ]
    .filter(Boolean)
    .join("\n");
}

function buildPrompt(request: EditRequest) {
  const parts = request.selections.length
    ? request.selections.map(describe).join("\n\n")
    : "(nothing selected; the request is about the page as a whole)";
  return `You are editing the Interface Chat repo in place, from a dev overlay on the page ${request.page}.

That page is src/features/interface-shells/interface-states.page.tsx. It renders every interface in src/features/interface-shells at every size and state, using the real shell components and fixtures. So a change to how an interface looks belongs in that interface's components (document/, search/, table/, more/, ui/) or its fixtures (model/shell-fixtures*.ts), not in the states page, unless the request is about the page's own layout.

The person selected these parts of the page:

${parts}

Their request:
${request.prompt}

Rules:
- Make the smallest change that does what they asked, and only to the selected parts unless they say otherwise.
- Follow the Adaption design system in docs/design-system.md: its tokens only, no new colours or fonts.
- You cannot run commands. The dev server hot-reloads, so don't try to verify in a browser.
- Finish with one or two plain sentences saying what you changed and in which files.`;
}

async function readJson(req: IncomingMessage): Promise<EditRequest> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    size += (chunk as Buffer).length;
    if (size > MAX_BODY) throw new Error("Request too large");
    chunks.push(chunk as Buffer);
  }
  const body = JSON.parse(Buffer.concat(chunks).toString("utf8")) as EditRequest;
  if (typeof body.prompt !== "string" || !body.prompt.trim()) throw new Error("Prompt is empty");
  if (!Array.isArray(body.selections)) throw new Error("Selections are missing");
  if (body.sessionId !== undefined && !/^[0-9a-f-]{8,64}$/i.test(body.sessionId)) {
    throw new Error("Bad session id");
  }
  return body;
}

/** Turns Claude's stream-json lines into the few events the overlay shows. */
function toEvents(line: string): EditEvent[] {
  let message: Record<string, unknown>;
  try {
    message = JSON.parse(line) as Record<string, unknown>;
  } catch {
    return [];
  }
  if (message.type === "system" && message.subtype === "init" && typeof message.session_id === "string") {
    return [{ kind: "session", id: message.session_id }];
  }
  if (message.type === "assistant") {
    const content = (message.message as { content?: unknown[] } | undefined)?.content ?? [];
    return content.flatMap((block): EditEvent[] => {
      const item = block as { type?: string; text?: string; name?: string; input?: Record<string, unknown> };
      if (item.type === "text" && item.text?.trim()) return [{ kind: "text", text: item.text.trim() }];
      if (item.type === "tool_use" && item.name) {
        const input = item.input ?? {};
        const target = input.file_path ?? input.pattern ?? input.path ?? "";
        return [{ kind: "tool", name: item.name, detail: String(target) }];
      }
      return [];
    });
  }
  if (message.type === "result") {
    const result = typeof message.result === "string" ? message.result : "";
    return message.is_error
      ? [{ kind: "error", message: result || "Claude stopped with an error." }]
      : [{ kind: "done", result }];
  }
  return [];
}

async function handleEdit(req: IncomingMessage, res: ServerResponse, root: string) {
  if (!isLocal(req)) {
    res.statusCode = 403;
    res.end("Editing is only available from localhost.");
    return;
  }
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.end("Method Not Allowed");
    return;
  }
  if (running) {
    res.statusCode = 409;
    res.end("An edit is already running.");
    return;
  }

  let request: EditRequest;
  try {
    request = await readJson(req);
  } catch (error) {
    res.statusCode = 400;
    res.end(String(error instanceof Error ? error.message : error));
    return;
  }

  res.statusCode = 200;
  res.setHeader("content-type", "application/x-ndjson");
  res.setHeader("cache-control", "no-cache");
  const send = (event: EditEvent) => res.write(`${JSON.stringify(event)}\n`);

  const args = [
    "-p",
    "--output-format",
    "stream-json",
    "--verbose",
    "--permission-mode",
    "acceptEdits",
    "--allowedTools",
    ...ALLOWED_TOOLS,
    "--disallowedTools",
    "Bash",
    ...(request.sessionId ? ["--resume", request.sessionId] : []),
  ];

  const child = spawn("claude", args, { cwd: root, stdio: ["pipe", "pipe", "pipe"] });
  running = child;
  let finished = false;
  let buffer = "";
  let stderr = "";

  child.stdout.setEncoding("utf8");
  child.stdout.on("data", (chunk: string) => {
    buffer += chunk;
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      for (const event of toEvents(line)) {
        if (event.kind === "done" || event.kind === "error") finished = true;
        send(event);
      }
    }
  });
  child.stderr.setEncoding("utf8");
  child.stderr.on("data", (chunk: string) => {
    stderr = (stderr + chunk).slice(-2000);
  });
  child.on("error", (error) => {
    finished = true;
    send({ kind: "error", message: `Couldn't start claude: ${error.message}` });
  });
  child.on("close", (code) => {
    running = null;
    if (!finished) {
      send({ kind: "error", message: stderr.trim() || `claude exited with code ${code ?? "unknown"}` });
    }
    res.end();
  });

  // Stop Claude if the page goes away or presses Stop.
  res.on("close", () => {
    if (running === child) child.kill("SIGTERM");
  });

  child.stdin.end(buildPrompt(request));
}

export function devEdit(): Plugin {
  return {
    name: "dev-edit",
    apply: "serve",
    configureServer(server: ViteDevServer) {
      server.middlewares.use("/__dev-edit", (req, res) => {
        void handleEdit(req, res, server.config.root);
      });
    },
  };
}
