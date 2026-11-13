# Chat and the interface library

Chat is the conversation. The interface library is the set of product surfaces that chat can open beside it. A reply stays in the thread. A paper, a plan or a list opens as its own interface, and you edit it there.

Chat is in the sidebar as **Chat** (`/app/chat-lab`). The **Interface library** (`/app/interface-library`) sits right below it.

## Three layers: interfaces, chat modes and tools

- **Interfaces** are surfaces that display information and let you work with it. There are 13, and Chat is one of them: it is the interface that *is* the conversation.
- **Chat modes** are two free-text fields on the Chat interface:
  - **Format** sets how the reply's text is laid out, such as "Pros & cons", "Step by step", or anything you type.
  - **Assistant** sets who replies or what they use, such as "Critic", "Tutor" or "Web search".

  Both fields suggest common values as you type, and both are pre-filled from the query: "Be honest, does my logline work?" suggests Critic. Neither is a design: the reply is ordinary markdown in the thread. The assistant applies for the whole thread, and the format shapes the first reply.
- **Tools** are things the model does, such as web search. A tool runs, and its output lands in an interface or in the reply.

Search shows how the layers split:

- The **Search interface** is the search itself: the query, the follow-up searches and whether each has finished, and the sites, filters and sources being read.
- **What it found** goes in the chat reply, with real links.
- **Running the search** is a tool.

## The 13 interfaces

| Interface | For |
| --- | --- |
| Chat | A plain conversation: questions, ideas and quick answers. Sent, it is a thread with Chat alone. |
| Document | Creating and editing writing: papers, reports, memos and emails. |
| Search | The search itself: queries, sources and filters as it runs. |
| Table | Columns and rows of text, tags or pictures: a shot list or a comparison. |
| Schedule | Planning tasks across hours and days, as a Gantt chart. Fields are durations in days. |
| Tracker | The steps to get something done, with owners and status. |
| Calendar | Events on dates across a month: what's on, when, and at what time. You can add, rename and remove events. |
| Reader | A smart reader for a document you already have: search it, ask it a question, find something. Answers go in the chat, and the passages they use are marked in the document. |
| Map | Places, distances and a shortlist around a location. |
| Diagram | A mind map, timeline or flowchart: ideas branching from a topic, events in order, or steps and decisions. Its kind is still `chart` in code and data. The type is one of its parts, so the model picks it from what's asked ("brainstorm" is a mind map, "history of" a timeline, "what happens if" a flowchart), and the person can switch it from the toolbar (the title row at M+). Each type keeps its own content, so switching back loses nothing. At large size every type is a board. |
| Guide | A recipe or how-to to follow step by step, with facts, what you need, and steps with notes. It works for recipes and furniture builds alike. |
| Canvas | A freeform, AI-enabled canvas: images, notes, colours, drawings and live components placed anywhere, and generated onto it. Its kind is still `moodboard` in code and data. |
| Generator | New text or images from an AI model: a prompt, reference images or both, shaped by controls (tone and length for text; style and aspect for images; creativity for both). Each run makes three variations, and you choose one. |

Each description is written around the job the interface does: find, understand, create, plan, track, compare or explore. Neighbouring interfaces name each other.

- Reader and Document split on whether the document already exists.
- Calendar is for events on dates, and Schedule is for hours and days of work.
- Tracker is for status, and Guide is for following steps.
- Moodboard collects references that exist, and Generator makes new ones.

## Sizes and states

Every interface is the same object at four sizes.

| Size | Where it appears | What it shows |
| --- | --- | --- |
| Small (S) | App icon | A white 3D glyph on a solid coloured tile. |
| Medium (M) | A tile on the chat home | The blank interface, named after its kind ("Document", not "Untitled"). Chat at M is just a bubble holding the query. |
| Medium plus (M+) | The card while you type | Every field is editable. ⌘↵ sends. |
| Large (L) | A window in the thread | The working interface, with room to edit. It sits in a window whose bar carries the glyph, so it doesn't repeat the glyph beside its title. Everything starts on one 24px edge, the same as the bar's icon: the title (with little space above it), toolbars, content and footer. Document's footer is just the word count. The key functions also appear at M+ and M. Diagram opens as a FigJam-style board: pan, zoom, a tool bar, and a small bar of options above whatever is selected. |

A host that frames a smaller size in a window too (the Workbench does at medium) passes `mark={false}`, so the glyph appears once, in the bar.

### Standard tools

Every large interface has a toolbar under its title. It leads with **Undo** and **Redo** (kept by `InterfaceShell` for whatever changes through the interface, with edits under 0.7s apart counted as one step), then the interface's own tools, then any tools generated for its content. Each set follows the app people already use for that job:

| Interface | Modelled on | Tools |
| --- | --- | --- |
| Document | Google Docs | Text style (Normal text, Heading 1, Heading 2); Bold, Italic, Strikethrough (⌘⇧X), Inline code, Insert link, Clear formatting; Bulleted list, Numbered list, Quote; Copy as Markdown, Download .md |
| Table | Google Sheets | Add a row, Add a column; Data cleanup (remove empty or duplicate rows); Copy as CSV, Download .csv. Each column header sorts A → Z, then Z → A |
| Tracker | Apple Reminders | New item, New list; Sort by due date, owner, title or not done first; Show or hide completed; Mark all as done, Clear completed; Copy as a checklist |
| Search | Google | Type (All, News, Images, Videos, Papers, Datasets) and Time (Any time to Past year) as filter chips; Search within a site; Clear filters; Copy the links, Open the top result, Open in Google (with the same sites, time and type) |
| Schedule | Gantt tools | New task, Add a day, Remove the last day; Longer or shorter days; Move everything 30 minutes earlier or later; Sort by start time; Copy as text, Download .csv |
| Calendar | Google Calendar | Today, previous and next month, the month's name; New event; Show or hide the agenda; Copy the agenda, Export to calendar (.ics) |
| Reader | Preview and Acrobat | Open a file; Zoom out and in; Highlight the selection, Ask the chat about the selection; Copy the highlights, Clear the highlights; Copy the text |
| Map | Google Maps | Filters (Open now, Top rated and so on); Sort by distance; Shortlist only; Zoom in, Zoom out, Re-centre; Directions (walking, in Google Maps), Open in Google Maps; Copy the list or shortlist |
| Canvas | FigJam and Milanote | Upload images, Add an image from a link, Add a colour; Shuffle, bigger or smaller tiles, captions on or off, true colours; Sort the palette light to dark, Copy the palette |
| Diagram | FigJam | Diagram type; Reset colours; Copy as an outline, Copy as Mermaid, Download .md (outline and Mermaid). Select, hand, add and zoom stay on the board's own bar |
| Guide | Recipe apps | Servings: scales every amount that starts a line, always from the original so rounding never adds up; Cook mode (keeps the screen on, bigger steps); Got everything, Start over; Copy the shopping list, Copy the recipe |
| Generator | Firefly and Midjourney | Text or Image; Add reference images, Clear references; Generate; Download all or Copy all; Clear results |

**Generated suggestions** (the Generative Tools page, `/app/generative-tools`) come in two kinds, and neither gets a row or a panel of its own:

- **Suggested values** sit among the real ones with the AI outline, as `SuggestedChip`: a filter among Search's or Map's filters, a tone, style or length among Generator's, a constraint among Schedule's, a ghost column at the end of a Table, an outlined item in a Tracker's first list, a note on a Moodboard canvas. Click to add; × to dismiss. They reach a shell as `suggested` (`SuggestedValues`); the page's stand-in is `generative-toolbar/model/suggest-values.ts`.
- **Suggested tools** (chips, sliders, 2×2s, choices, toggles) go in the toolbar after the standard tools, or inside a row the interface already has (`SUGGESTION_PLACES`): Document's footer by the word count, Schedule's day settings, Generator's prompt box, a Diagram's or Moodboard's board. Defaults are in `generative-toolbar/model/tool-places.ts`; a tool's own `place` wins.

Tables sort from each column's header. Right-clicking a header opens Sheets' column menu (sort, insert left or right, rename, type, delete), and dragging a header moves its column.

Generator keeps **presets** (four built in, plus the person's own, saved in the browser) under Presets in its toolbar, and takes the person's own tones, styles and lengths. Length is free text as well as Short, Medium or Long.

**Canvas (formerly Moodboard; kind `moodboard`) is an AI-enabled canvas at large.** Images, notes, colours, SVG drawings and live HTML components sit anywhere on a FigJam-style board and drag about freely. The prompt bar asks the model for an Image, a Note, a Drawing or a Component through `/api/generate`, in modes `image`, `text`, `svg` and `html`. What's selected shapes the request: an image becomes a reference, a note's words become context, and a selected drawing or component is revised in place. Each selected thing has its own AI actions:

- Image: More like this, Describe it, Draw it.
- Note: Turn into images, Expand, Draw it, Build it.
- Drawing or component: Edit with AI, Another take, Download SVG or Copy HTML.

The server strips scripts, handlers and embeds from drawings and components. Drawings render as images, and components in a frame that never runs scripts. Positions live in `items` (`model/canvas-layout.ts`). The medium card, medium plus and inline show the canvas in miniature (`ui/canvas-mini.tsx`), and edits made there land on the canvas.

The pieces are in `interface-shells/ui/shell-toolbar.tsx`: `ShellToolButton`, `ShellToolText` (words, as "Today"), `ShellToolMenu`, `ShellToolPopover` with `ShellToolField`, and `ShellToolFile`. Every tool does its job on the spot, with no model call; a tool that needs something it doesn't have is disabled rather than hidden.

### Inline

In a chat reply, every interface (except Chat, which is the conversation) comes in two inline sizes. Neither has a background or box: type, hairlines and the content's own colours do the work, so it reads as part of the message. Large is never inline: it's always its own window.

| Inline size | What it shows | Used for |
| --- | --- | --- |
| Small | One line: the glyph, the title and the key detail ("1 of 4 done", "6 places near Harbour Pier"), with a progress ring or a few colours where the interface has them, and an action on hover | Pointing at work that lives elsewhere, such as an interface open in its own window |
| Medium | The glyph, title and detail, then a short preview designed for the interface (below) | Showing what the reply made |

Inline medium, by interface:

| Interface | Preview |
| --- | --- |
| Document | The opening: headings, paragraphs and lists as text, fading out |
| Search | Filter chips, then the top three results with their sites; before results, the searches being run |
| Table | The first four columns and rows on hairlines, with image and tag cells |
| Schedule | Each day as a track across the working hours, its tasks as coloured bars |
| Tracker | A progress bar, then the first items with owner and due date |
| Calendar | An agenda: day, event and time |
| Reader | What was asked, then the marked passages with their notes |
| Map | The map beside the first places, starred where shortlisted |
| Canvas | The canvas in miniature, laid out as in its window, then the palette and notes |
| Diagram | By type. Mind map: each branch as a coloured label with its ideas. Timeline: up to five events along a line, dated above and named below. Flowchart: the main path from the start as a chain of steps, decisions marked with a diamond |
| Guide | What's needed, then the first steps with their timers |
| Generator | The three variations side by side, the chosen one ringed; clicking one chooses it |

Inline medium can be edited where it stands, without changing size: titles and visible text take a caret (`InlineText`), checklist items and guide steps tick, map places star, and chips get a × while selected. Clicking or typing into it selects it: the same design takes a white background and an outline, so it reads as an interface. Escape finishes editing, then puts it back. **Pin ↗** moves it into a window. The Interface State page has an Inline · Small and an Inline · Medium column for every interface.

The code is in `interface-shells/inline/`: `InlineSmall`, `InlineMedium` (one preview per interface), `InlineShell` (medium in a reply, selected on click) and `inline-summary.ts` (title and detail).

Each size has three content states: **Empty**, **Suggestion** and **History**. Suggestion and History only apply at M+, because M is always the blank interface. Empty interfaces say in grey what you can add, inside the interface: "Add additional context", "Add a filter", or placeholder rows such as "Item 1".

Projects are not a concept on the interfaces. A past chat that used several interfaces simply shows as a group among past chats in the menu.

## The library page

The library is where interfaces are designed, and it is also the list that retrieval reads.

- **Toolbar.** A frozen top row sets the size (S, M, M+ or L) and the content (Empty, Suggestion or History) for every row at once.
- **Opening a row.** Clicking a medium card, or pressing ⌘↵ at M+, opens that row one size up until the toolbar changes.
- **Table.** There is one row per interface:

| Interface | Parts | Description | Example queries |
| --- | --- | --- | --- |
| A live preview at the toolbar's size. At L the preview spans the whole row. | Typed parts, like a tool's parameters: `title` (text, required), `length` (target), `columns`. Hover a part to see the description the model reads. | When to use it, a **Not for** line naming the interface to use instead, and **trigger words** and **related words** as chips. | Prompts that should open it, then near misses that should not. |

Chat's row also lists the Format and Assistant suggestions.

Editing a row changes retrieval immediately, because it is the list the matcher reads. Edits last until the page reloads.

## How an interface gets chosen

The approach follows how models pick tools and skills from a large library.

1. **A cheap matcher narrows the library.** It runs on every keystroke, with no model and no network. It scores the draft against each interface's words and example queries, and docks points for drafts that read like a near miss:
   - **Trigger words** name the interface or its job ("spreadsheet", "cover letter", "where can I"). One is enough to bring the interface forward, and a second confirms it.
   - **Related words** lean towards an interface without naming it ("restaurant", "budget", "colours"). One alone does nothing; two bring the interface forward, and one settles a tie.
   - **Example queries** count when the draft shares most of an example's words.

   It matches whole words, allowing for inflections: "compare" also catches "comparing" and "essay" catches "essays". This is one-way, so a listed plural such as "pros" still needs the plural. Accents are ignored ("cafés" is "cafes"). An interface beats a chat format on equal evidence, so "best restaurants in Lisbon" is a map.

   The chat home and a thread use the same scores, so they agree: "make a tracker" is a Tracker in both. In a thread the top five go to the model as candidates. The same score decides whether a follow-up asks for a different interface from the one open. Blog, Email, Code, Slides, Kanban and a plain Chart have no library profile yet, so a thread finds them by keyword, worth one trigger.
2. **The model chooses from at most five candidates.** For each candidate, the model sees the description, the Not for line, the typed parts, up to four examples and up to three near misses. It then either opens one candidate (with `open_interface`, or by filling it straight away) or answers in chat. It never sees the whole library, which keeps its choice sharp as the library grows. It never opens more than one interface in a turn.
3. **A chosen card skips step 2.** If the chat home's card was suggested or chosen when you sent, that interface opens directly with the card's fields, and the model does not re-pick.

The rules of thumb are:

- **Descriptions decide.** Say what the interface is first and when to choose it second. Keep descriptions short, and name the neighbour to use instead, because overlapping descriptions cause most wrong picks.
- **Parts are parameters.** Typed parts tell the model what to fill, the way a tool's input schema does.
- **Near misses come from mistakes.** When a prompt opens the wrong interface, add the prompt as a near miss.
- **Misses come from vocabulary.** When a prompt opens nothing, add the word that names the job as a trigger, or a topical word as a related word. Add both kinds of prompt to `shell-retrieval.test.ts`.

## In a thread

Every thread is a workbench (see [workbench.md](workbench.md)): Chat is the page, and interfaces are windows beside it that minimize to the strip in the top right. Each thread keeps its own layout.

- **From the home.** Picking an interface card and sending opens that interface large, with Chat as a sidebar. Anything else opens as Chat alone.
- **In a reply.** An interface the model makes is shown inline under the reply that made it. Something long (a document of about 900 characters or more) opens as its own window. **Pin ↗** on an inline interface, or clicking into it and sending another turn, moves it into a window; the reply then keeps a small pointer to it.
- **Nothing closes by itself.** Windows stay until you minimize them. Right-click an app icon to delete it from the thread.
- **What the model works on** is the window used last (or the interface it just made, or an inline one you clicked into). Turns go into it unless the message plainly asks for a different kind. It's fixed when the turn is sent, so switching windows mid-reply doesn't redirect the writing.
- **Chat minimized.** The input stays on the page. The reply shows above it for a few seconds, and a new interface opens beside the work.
- **Highlight** in a window sends the change as your turn, about that window.
- **+** in the top bar opens a new, empty interface large.

What the model can do with each:

- **Document, Table and Tracker** are in the catalogue (below): the model fills each through its own tool, you watch it fill, and later turns change one part of it.
- **Search** is written through `write_interface`: it runs `web_search`, writes its results, and keeps its filter chips.
- **Every other interface** holds its card's data. You edit it, and the model sees its contents as JSON and refers to them by name, but it doesn't write into it yet.
- **Generator** runs itself: **Generate** (or ⌘↵ in its prompt) calls `/api/generate`, which returns three variations, text from the chat model and images from `gpt-image-1-mini`. Reference images are scaled to 1024px in the browser and sent as data URLs. The model reading the thread sees the prompt, controls and variations, with pictures shown as `[image]`. On the chat home the mode is set from the prompt: "taglines" opens Text, "an image of" opens Image.
- **Chat** opens nothing. Its Assistant and Format are sent with the turn (`chatModes`) and become part of the system prompt.

## The catalogue

The catalogue is how the model fills an interface. It follows [json-render](https://github.com/vercel-labs/json-render)'s approach without the dependency, and is piloted on Document, Table and Tracker. It lives in `interface-shells/model/shell-catalogue.ts`, which the app and the chat API both read.

Each entry is one interface: a description, a few lines on writing it well, and a zod schema. The schema does three jobs:

- **It is the tool's input.** Each entry has a fill tool (`fill_document`, `fill_table`, `fill_tracker`), and the model only gets the tools for the interface that's open or the ones the turn could open.
- **It is what the model reads.** The Parts line in a candidate is generated from the schema, so the description and the tool can't drift apart.
- **It checks the model's writes.** A fill that doesn't match the schema goes back to the model as an error.

| Interface | Fields |
| --- | --- |
| Document | `title`, `body` (markdown) |
| Table | `title`, `columns` (label and type), `rows` (lists of cells in column order) |
| Tracker | `title`, `groups`, `items` (label, owner, due, done, group) |

**One entry per interface, not per size.** Every schema has an optional `placement` (`inline` or `window`). The app still decides: a long document opens a window, Pin moves anything into one, and Chat minimized opens beside the work. `placement: "window"` is the model asking for a window sooner.

**It fills as it streams.** The tool's input arrives as partial JSON. `readCatalogueValue` keeps whatever is usable so far (dropping a column with no label yet, squaring up a half-written row), and the interface is redrawn about every 60ms. The title comes first, so the interface is named before it fills.

**Later turns change one part.** With a catalogue interface open, the model is sent its contents as JSON and gets `update_interface`: a list of `add`, `replace` and `remove` operations on a path such as `/rows/2/1` or `/items/-`. The server applies them to the contents it was sent and checks the result against the schema; an error goes back to the model to fix. The app applies them to its own copy once the server has accepted them. Removing or inserting a table column moves every row's cells with it. Past 12,000 characters the contents aren't sent, and the model rewrites instead.

To add an interface to the catalogue: add its schema and entry, teach `chat-lab/model/catalogue-adapters.ts` to read and write its data, and add cases to `shell-catalogue.test.ts`.

## Where it lives

| What | Where |
| --- | --- |
| Chat UI | `src/features/chat-lab`. The thread is the Pharos chat surface inside a workbench, streamed from OpenAI. |
| Thread layout and windows | `chat-lab/model/chat-lab-workbench.ts`, drawn by `WorkbenchSurface` from `src/features/workbench`. |
| Chat API | `api/_ai-chat-lab.ts`, with the tools `open_interface`, the catalogue's fill tools, `update_interface`, `write_interface` and `web_search`. |
| Catalogue | `interface-shells/model/shell-catalogue.ts` (schemas, partial reads, operations) and `chat-lab/model/catalogue-adapters.ts` (to and from a thread's interfaces). |
| Interfaces | `src/features/interface-shells`. Each interface at every size is in `document/`, `search/`, `table/` or `more/`. |
| Library page | `src/features/interface-shells/interface-library.page.tsx` |
| Retrieval profiles | `interface-shells/model/shell-retrieval.ts`: descriptions, Not for lines, examples, near misses and triggers. |
| Parts | `interface-shells/model/shell-parts.ts` |
| Fixtures | `interface-shells/model/shell-fixtures*.ts`: the empty, suggestion and history content. |
| Chat formats and assistants | `interface-shells/model/chat-formats.ts` |
| Matcher | `interface-shells/model/shell-retrieval.ts` scores; `chat-lab/model/visual-interfaces.ts` turns them into the model's candidates, and `chat-lab/model/home-ranking.ts` into the chat home's cards. |

To add an interface:

1. Add its kind to `SHELL_KINDS` in `shell-types.ts`.
2. Give it a component in `more/`, metadata in `shell-meta.ts`, a retrieval profile, parts and fixtures, and a place in `chat-lab/model/home-layout.ts`.
3. Add a few prompts to `home-ranking.test.ts` to check that it routes.
