import { readFile, writeFile } from "node:fs/promises";
import type { IncomingMessage, ServerResponse } from "node:http";
import { join } from "node:path";
import type { Plugin, ViteDevServer } from "vite";

/**
 * Dev only: lets the Design System page (/design-system) read and save the
 * interface design tokens. It writes one file, and only after checking the
 * body is a token file of the same shape: every token already in the file is
 * still there, with a value of the same kind. It can't add, remove or write
 * anything else.
 */
const TOKENS = "src/features/interface-shells/design/shell-tokens.json";

type Node = Record<string, unknown>;
const isToken = (value: unknown): value is Node => typeof value === "object" && value !== null && "$value" in value;

/** The token paths and the kind of each value, so a save can only change values. */
function shapeOf(node: unknown, path = "", out = new Map<string, string>()) {
  if (isToken(node)) {
    out.set(path, typeof node.$value);
    return out;
  }
  if (typeof node === "object" && node !== null) {
    for (const [key, value] of Object.entries(node)) {
      if (!key.startsWith("$")) shapeOf(value, path ? `${path}/${key}` : key, out);
    }
  }
  return out;
}

async function body(req: IncomingMessage) {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  return Buffer.concat(chunks).toString("utf8");
}

async function handle(req: IncomingMessage, res: ServerResponse, root: string) {
  const file = join(root, TOKENS);
  const reply = (status: number, value: unknown) => {
    res.statusCode = status;
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify(value));
  };
  try {
    if (req.method === "GET") return reply(200, JSON.parse(await readFile(file, "utf8")));
    if (req.method !== "PUT") return reply(405, { error: "GET or PUT" });
    const next = JSON.parse(await body(req));
    const before = shapeOf(JSON.parse(await readFile(file, "utf8")));
    const after = shapeOf(next);
    for (const [path, kind] of before) {
      if (after.get(path) !== kind) return reply(400, { error: `${path} is missing or changed kind` });
    }
    if (after.size !== before.size) return reply(400, { error: "A save can only change values, not add or remove tokens" });
    await writeFile(file, `${JSON.stringify(next, null, 2)}\n`);
    return reply(200, { saved: TOKENS });
  } catch (error) {
    return reply(500, { error: String(error) });
  }
}

export function devTokens(): Plugin {
  return {
    name: "dev-tokens",
    apply: "serve",
    configureServer(server: ViteDevServer) {
      server.middlewares.use("/__design-tokens", (req, res) => {
        void handle(req, res, server.config.root);
      });
    },
  };
}
