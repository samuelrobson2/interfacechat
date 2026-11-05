# Interface Chat

Interface Chat is a prototype of chat that opens **interfaces** instead of only replying with text. Ask for a paper and a document opens beside the thread. Ask for a packing list and a tracker opens. Ask a quick question and you get an ordinary reply. Each interface comes from a library of 14, and the library is also the list the app reads to decide which one to open.

It is a standalone copy of the sam-ideas prototype, cut down to the chat, the interface library and the four Pharos pillars. It runs on mock data with no backend or sign-in. The only live service is OpenAI, which streams the chat replies.

- **Where things stand and what's next:** [docs/STATUS.md](docs/STATUS.md)
- **How chat and the library work:** [docs/chat-and-interface-library.md](docs/chat-and-interface-library.md)
- **How the chat home behaves as you type:** [docs/chat-home-behaviour.md](docs/chat-home-behaviour.md)
- **Visual language (type, colour, radii):** [docs/design-system.md](docs/design-system.md)

## What's in it

The sidebar has two groups.

**Pharos.** These are the core pillars from Pharos, running on demo data.

| Item | Route | What it is |
| --- | --- | --- |
| Build / Dashboard | `/app/datasets`, `/app/dataset/:id` | Datasets, a dataset's dashboard, the new-dataset flow and fine-tuning. |
| Chat | `/app/chat-lab` | The chat home and threads, with the interface library wired in. This is the main work. |
| Visualize | `/app/chat/visualize` | Chat that answers with charts. It uses the `visualize` endpoint. |
| History | `/app/chat-folders` | Past chats and folders. |

**Tools.** These are workbenches for designing the product.

| Item | Route | What it is |
| --- | --- | --- |
| UI Kit | `/app/ui-kit` | The component kit (`src/shared/ui/kit`), with a page per component. |
| Common UI Examples | `/app/common-ui-examples` | Reference compositions, such as the document analyser. |
| Interface library | `/app/interface-library` | All 14 interfaces in one table. Each row has a live preview at any size, plus its parts, description and example queries. You design interfaces here, and retrieval reads from here. |

## Run locally

```bash
pnpm install
cp .env.example .env.local   # then add your OpenAI key
pnpm dev                     # http://localhost:5173/app
```

`.env.local` is git-ignored, so never commit it. It takes these values:

```bash
OPENAI_API_KEY=sk-...
OPENAI_CHAT_MODEL=...     # optional; picks the chat model
VITE_AUTH_BYPASS=true     # skip sign-in locally
```

Without a key, everything still renders and only the AI replies fail. In development, Vite serves the `api/` functions itself (see `vite.config.ts`), so you don't need `vercel dev`.

Other commands:

```bash
pnpm test            # vitest
pnpm build           # type-check, then build
pnpm storybook       # UI kit stories
```

## How it's built

- **Stack:** Vite, React 19, TypeScript, Tailwind v4, motion (`motion/react`), and react-router with lazy routes. The app is served under `/app`.
- **AI:** the Vercel AI SDK with `@ai-sdk/openai`. The chat uses OpenAI's Responses API with built-in web search.
- **Mock data:** `VITE_DEMO_MODE=true` swaps the backend for in-memory demo data and skips auth gates. Only set it on deployments that are meant to be demos.

```
api/
  ai/[action].ts        one function that serves every AI endpoint (see Deploy)
  _ai-chat-lab.ts       chat: open_interface, write_interface, web_search
  _ai-chat-lab-*.ts     chat title, icon and suggestions
  _ai-interface-fill.ts fill an interface's fields from a prompt
  _ai-visualize.ts      Visualize's chart answers
src/
  app/                  router, layouts, route groups
  features/
    chat-lab/           chat home, threads and docking (the main work)
    interface-shells/   the 14 interfaces and the library page
    chat, chat-original, chat-workspace, chat-visualize, history
    dataset-dashboard, new-dataset, dataset-finetune
    ui-kit, common-ui-examples, sidebar, settings, auth
  shared/               routes, API client, mock backend, UI kit
docs/                   the docs linked above
```

## Deploy

The app deploys on Vercel as a Vite static site plus serverless functions.

- **Build:** `vercel.json` runs `VITE_DEMO_MODE=true vite build`. This build skips the type check.
- **One function:** the Hobby plan caps a deployment at 12 functions, so every AI endpoint goes through one function, `api/ai/[action].ts`. `vercel.json` rewrites `/api/chat-lab`, `/api/visualize` and the other AI paths to it. Only files without a leading `_` count as functions. To add an endpoint, write `api/_ai-<name>.ts`, register it in `api/ai/[action].ts`, and add its name to the rewrite.
- **Environment:** set `OPENAI_API_KEY`, and optionally `OPENAI_CHAT_MODEL`, in the Vercel project.
