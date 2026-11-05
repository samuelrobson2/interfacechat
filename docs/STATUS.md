# Status

Last updated: 5 November 2026.

## Where we're at

Interface Chat was split out of the sam-ideas prototype to focus on one idea: **chat that opens the right interface**. It keeps the Pharos pillars (Build/Dashboard, Chat, Visualize and History) and the design tools (UI Kit, Common UI Examples and the Interface library). Everything else was cut.

### Done

**Interface library**

- 14 interfaces, each at four sizes (S, M, M+ and L) and in three states (Empty, Suggestion and History).
- One table that serves as both the design surface and the retrieval list. Each row has a live preview, typed parts, a description with a Not for line and trigger words, and example queries with near misses.
- The newer interfaces (Schedule, Tracker, Calendar, Reader, Map, Moodboard, Timeline, Flowchart, Mind map and Guide) work as widgets at large size, and their key functions also appear at M+ and M. You can add calendar events and remove moodboard colours, for example. Guide has been road-tested on recipes and furniture builds.
- Chat is an interface with free-text Format and Assistant fields. Pros & cons, lists and explainers are now formats, not interfaces of their own.

**Chat home**

- A calm, fixed field of interfaces around the headline.
- A recognised interface takes the middle with a ring, then grows to M+ once the draft has detail.
- The prompt and the card stay in sync in both directions.
- The page can be dragged.
- Esc or × dismisses the card.

**Threads**

- Sending docks the chosen interface beside the thread.
- Document, Search and Table are written into by the model.
- Every other interface is edited by you, and the model can read it.
- Chat's Assistant and Format are sent with the turn.

**Repo**

- A fresh repo and a fresh Vercel project.
- Every AI endpoint goes through one function, `api/ai/[action].ts`, to stay under the 12-function cap.

### Known gaps

- The model writes into Document, Search and Table only. It can read the other 11 interfaces but can't fill them yet.
- A thread docks one interface at a time. There's no tray for several interfaces yet.
- On the chat home, Tab into the card isn't built, and neither is flashing the changed words in the prompt.
- Suggestions and past work aren't shown on the chat home field. The data sources still exist.
- Library edits aren't saved; they reset on reload.
- One test fails before any of this work: `use-signup.test.ts`.
- `pnpm build` reports type errors that pre-date the split. The Vercel build skips the type check.

## What's next

1. **Broad tasks go to chat first.** For a prompt like "Plan an offsite to Singapore", Chat should lead. The model breaks the task down in the thread, then opens the first interface that fits, such as Calendar for dates, Map for venues or Tracker for bookings. This needs a decision on the go-ahead.
2. **Several interfaces in one thread.** One interface sits in primary view, docked, and the rest wait in a tray. The model can add an interface to the tray, or propose bringing one forward, without taking the view away from what you're working on.
3. **Let the model write into every interface,** using each interface's typed parts as the schema for `write_interface`.
4. **Match by meaning** on the home with a small in-browser embedding model, so matching stays instant as the library grows.
5. **Bring past work back** to the home as quiet history, once the field's calm layout is settled.
6. **Persist library edits** so the library can be tuned without code changes.

## Links

- Repo: https://github.com/samuelrobson2/interfacechat
- Overview, setup and deploy: [README.md](../README.md)
- How chat and the library work: [chat-and-interface-library.md](chat-and-interface-library.md)
- Chat home behaviour: [chat-home-behaviour.md](chat-home-behaviour.md)
