import * as chatLab from "../_ai-chat-lab.js";
import * as chatLabIcon from "../_ai-chat-lab-icon.js";
import * as chatLabSuggestions from "../_ai-chat-lab-suggestions.js";
import * as chatLabTitle from "../_ai-chat-lab-title.js";
import * as interfaceFill from "../_ai-interface-fill.js";
import * as visualize from "../_ai-visualize.js";

/**
 * Single Serverless Function fronting the AI endpoints, dispatched by the
 * `[action]` path segment (e.g. POST /api/ai/chat-lab). `vercel.json` rewrites
 * the flat paths the frontend calls (`/api/chat-lab`, `/api/visualize`, ...)
 * here, and `vite.config.ts` mirrors that under `pnpm dev`. It keeps the deployment
 * under the Hobby plan's 12-function cap.
 *
 * Handlers live in `api/_ai-<action>.ts`; the underscore keeps Vercel from
 * deploying each as its own function.
 */
type Handler = (req: Request) => Response | Promise<Response>;
type Module = { GET?: Handler; POST?: Handler };

const MODULES: Record<string, Module> = {
  "chat-lab": chatLab,
  "chat-lab-icon": chatLabIcon,
  "chat-lab-suggestions": chatLabSuggestions,
  "chat-lab-title": chatLabTitle,
  "interface-fill": interfaceFill,
  "visualize": visualize,
};

// The longest of the merged handlers' own limits.
export const maxDuration = 60;

function dispatch(method: "GET" | "POST") {
  return async (req: Request): Promise<Response> => {
    const action = new URL(req.url).pathname.split("/").pop() ?? "";
    const handler = MODULES[action]?.[method];
    if (!handler) {
      return new Response(
        JSON.stringify({ error: `Unknown AI action: ${method} ${action}` }),
        { status: 404, headers: { "content-type": "application/json" } },
      );
    }
    return handler(req);
  };
}

export const GET = dispatch("GET");
export const POST = dispatch("POST");
