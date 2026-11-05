import { existsSync } from "node:fs";
import type { IncomingMessage, ServerResponse } from "node:http";
import { join } from "node:path";
import { Readable } from "node:stream";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv, type Plugin, type ViteDevServer } from "vite";
import viteTsconfigPaths from "vite-tsconfig-paths";

// Dev-only: serve the Vercel functions in `api/*.ts` from the Vite dev server so
// `npm run dev` gives working /api routes without needing `vercel dev` (which
// fights this app's `/app` base and causes a redirect loop). It bridges Node's
// req/res to the Web Request/Response the handlers expect, dispatching
// /api/<name> to api/<name>.ts, or to the collapsed api/ai/[action].ts.
function devApi(env: Record<string, string>): Plugin {
  return {
    name: "dev-api",
    apply: "serve",
    configureServer(server: ViteDevServer) {
      // The handlers read process.env; mirror the server-side keys from .env.*.
      const serverKeys = ["OPENAI_API_KEY", "OPENAI_CHAT_MODEL"];
      for (const key of serverKeys) {
        if (env[key] && !process.env[key]) {
          process.env[key] = env[key];
        }
      }

      server.middlewares.use("/api", (req, res) => {
        void handleApi(req, res, server);
      });
    },
  };
}

async function handleApi(
  req: IncomingMessage,
  res: ServerResponse,
  server: ViteDevServer,
) {
  // Connect strips the "/api" mount, so req.url is "/<name>?...".
  const rawUrl = req.url ?? "";
  const queryString = rawUrl.includes("?") ? rawUrl.slice(rawUrl.indexOf("?")) : "";
  const rawName = rawUrl.split("?")[0].replace(/^\/+/, "").replace(/\/+$/, "");
  // Mirror vercel.json: `/api/<name>` → `api/ai/[action].ts` whenever an
  // `api/_ai-<name>.ts` handler exists (vercel.json lists the same names).
  const isAiAction =
    /^[a-z0-9-]+$/.test(rawName) &&
    existsSync(join(server.config.root, "api", `_ai-${rawName}.ts`));
  const name = isAiAction ? `ai/${rawName}` : rawName;
  // Allow a flat route (`foo`) or one nested segment (`foo/bar`), matching the
  // `api/foo.ts` and `api/foo/[action].ts` (dynamic) route shapes.
  if (!/^[a-z0-9-]+(\/[a-z0-9-]+)?$/.test(name)) {
    res.statusCode = 404;
    res.end("Not Found");
    return;
  }
  const method = (req.method ?? "GET").toUpperCase();
  if (method !== "POST" && method !== "GET") {
    res.statusCode = 405;
    res.end("Method Not Allowed");
    return;
  }
  // Resolve the module: flat file, an exact nested file, or the `[action]`
  // dynamic route (Vercel-style) that the dispatcher parses from the path.
  const segments = name.split("/");
  let modulePath = `/api/${name}.ts`;
  if (segments.length === 2) {
    const [dir, action] = segments;
    modulePath = existsSync(join(server.config.root, "api", dir, `${action}.ts`))
      ? `/api/${dir}/${action}.ts`
      : `/api/${dir}/[action].ts`;
  }
  try {
    const mod = await server.ssrLoadModule(modulePath);
    const handler = mod[method] as
      | ((request: Request) => Promise<Response>)
      | undefined;
    if (typeof handler !== "function") {
      res.statusCode = 404;
      res.end("Not Found");
      return;
    }

    const headers: Record<string, string> = {
      "content-type": req.headers["content-type"] ?? "application/json",
    };

    let body: Buffer | undefined;
    if (method === "POST") {
      const chunks: Buffer[] = [];
      for await (const chunk of req) chunks.push(chunk as Buffer);
      body = Buffer.concat(chunks);
    }

    const request = new Request(`http://localhost/api/${name}${queryString}`, {
      method,
      headers,
      body,
    });

    const response = await handler(request);
    res.statusCode = response.status;
    response.headers.forEach((value, key) => res.setHeader(key, value));
    if (response.body) {
      Readable.fromWeb(response.body as unknown as Parameters<typeof Readable.fromWeb>[0]).pipe(res);
    } else {
      res.end(await response.text());
    }
  } catch (err) {
    res.statusCode = 500;
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ error: String(err) }));
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // `""` prefix loads all vars (incl. non-VITE_ server keys) from .env files.
  const env = loadEnv(mode, process.cwd(), "");
  return {
    base: "/app",
    plugins: [
      react({
        babel: {
          plugins: [["babel-plugin-react-compiler"]],
        },
      }),
      viteTsconfigPaths(),
      tailwindcss(),
      devApi(env),
    ],
    server: {
      host: true,
      port: 3000,
      // Dev only: allow any host so a tunnel (ngrok static domain, cloudflared,
      // etc.) can reach the dev server without per-host allowlisting.
      allowedHosts: true,
    },
  };
});
