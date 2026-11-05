# Chat and the interface library

Chat is the conversation. The interface library is the set of product surfaces that chat can open beside it. A reply stays in the thread. A paper, a plan or a list opens as its own interface, and you edit it there.

Chat is in the sidebar as **Chat** (`/app/chat-lab`). The library is under **Tools → Interface library** (`/app/interface-library`).

## Three layers: interfaces, chat modes and tools

- **Interfaces** are surfaces that display information and let you work with it. There are 14, and Chat is one of them: it is the interface that *is* the conversation.
- **Chat modes** are two free-text fields on the Chat interface:
  - **Format** sets how the reply's text is laid out, such as "Pros & cons", "Step by step", or anything you type.
  - **Assistant** sets who replies or what they use, such as "Critic", "Tutor" or "Web search".

  Both fields suggest common values as you type, and both are pre-filled from the query: "Be honest, does my logline work?" suggests Critic. Neither is a design: the reply is ordinary markdown in the thread. The assistant applies for the whole thread, and the format shapes the first reply.
- **Tools** are things the model does, such as web search. A tool runs, and its output lands in an interface or in the reply.

Search shows how the layers split:

- The **Search interface** is the search itself: the query, the follow-up searches and whether each has finished, and the sites, filters and sources being read.
- **What it found** goes in the chat reply, with real links.
- **Running the search** is a tool.

## The 14 interfaces

| Interface | For |
| --- | --- |
| Chat | A plain conversation: questions, ideas and quick answers. Sent, it is an ordinary thread with nothing docked. |
| Document | Creating and editing writing: papers, reports, memos and emails. |
| Search | The search itself: queries, sources and filters as it runs. |
| Table | Columns and rows of text, tags or pictures: a shot list or a comparison. |
| Schedule | Planning tasks across hours and days, as a Gantt chart. Fields are durations in days. |
| Tracker | The steps to get something done, with owners and status. |
| Calendar | Dates, availability and clashes across a month. You can add events. |
| Reader | Understanding or finding things in a document you already have. It previews the PDF. |
| Map | Places, distances and a shortlist around a location. |
| Timeline | Events in order, to see what happened when. |
| Flowchart | Steps, decisions and the paths between them. |
| Mind map | Ideas branching out from a central topic. |
| Guide | A recipe or how-to to follow step by step, with facts, what you need, and steps with notes. It works for recipes and furniture builds alike. |
| Moodboard | Images, colours and words collected for a look. |

Each description is written around the job the interface does: find, understand, create, plan, track, compare or explore. Neighbouring interfaces name each other.

- Reader and Document split on whether the document already exists.
- Calendar is for dates, and Schedule is for hours and days of work.
- Tracker is for status, and Guide is for following steps.

## Sizes and states

Every interface is the same object at four sizes.

| Size | Where it appears | What it shows |
| --- | --- | --- |
| Small (S) | App icon | A white 3D glyph on a solid coloured tile. |
| Medium (M) | A tile on the chat home | The blank interface, named after its kind ("Document", not "Untitled"). Chat at M is just a bubble holding the query. |
| Medium plus (M+) | The card while you type | Every field is editable. ⌘↵ sends. |
| Large (L) | Docked beside the thread | The working interface, with room to edit. The key functions also appear at M+ and M. |

Each size has three content states: **Empty**, **Suggestion** and **History**. Suggestion and History only apply at M+, because M is always the blank interface. Empty interfaces say in grey what you can add, inside the interface: "Add additional context", "Add a filter", or placeholder rows such as "Item 1".

Projects are not a concept on the interfaces. A past chat that used several interfaces simply shows as a group among past chats in the menu.

## The library page

The library is where interfaces are designed, and it is also the list that retrieval reads.

- **Toolbar.** A frozen top row sets the size (S, M, M+ or L) and the content (Empty, Suggestion or History) for every row at once.
- **Opening a row.** Clicking a medium card, or pressing ⌘↵ at M+, opens that row one size up until the toolbar changes.
- **Table.** There is one row per interface:

| Interface | Parts | Description | Example queries |
| --- | --- | --- | --- |
| A live preview at the toolbar's size. At L the preview spans the whole row. | Typed parts, like a tool's parameters: `title` (text, required), `length` (target), `columns`. Hover a part to see the description the model reads. | When to use it, a **Not for** line naming the interface to use instead, and **trigger words** as chips. | Prompts that should open it, then near misses that should not. |

Chat's row also lists the Format and Assistant suggestions.

Editing a row changes retrieval immediately, because it is the list the matcher reads. Edits last until the page reloads.

## How an interface gets chosen

The approach follows how models pick tools and skills from a large library.

1. **A cheap matcher narrows the library.** It runs on every keystroke, with no model and no network. It scores the draft against each interface's trigger words, its description and its example queries, and docks points for drafts that read like a near miss. It matches whole words only.
2. **The model chooses from at most five candidates.** For each candidate, the model sees the description, the Not for line, the typed parts, up to four examples and up to three near misses. It then either calls `open_interface` with one candidate or answers in chat. It never sees the whole library, which keeps its choice sharp as the library grows. It never opens more than one interface in a turn.
3. **A chosen card skips step 2.** If the chat home's card was suggested or chosen when you sent, that interface opens directly with the card's fields, and the model does not re-pick.

The rules of thumb are:

- **Descriptions decide.** Say what the interface is first and when to choose it second. Keep descriptions short, and name the neighbour to use instead, because overlapping descriptions cause most wrong picks.
- **Parts are parameters.** Typed parts tell the model what to fill, the way a tool's input schema does.
- **Near misses come from mistakes.** When a prompt opens the wrong interface, add the prompt as a near miss.

## In a thread

Once an interface is open, later turns about it go into that interface instead of retrieving a new one. Chat messages stay short: a question, what was filled in, or what to decide next.

- **Document, Search and Table** are written into by the model through `write_interface`:
  - Document receives markdown.
  - Search runs `web_search`, writes its results, and keeps its filter chips.
  - Table receives one markdown table, keeping any columns you asked for.
- **Every other interface** opens docked with its card's data at large size. You edit it, and the model sees its contents as JSON and refers to them by name, but it doesn't write into it yet.
- **Chat** docks nothing. Its Assistant and Format are sent with the turn (`chatModes`) and become part of the system prompt.

## Where it lives

| What | Where |
| --- | --- |
| Chat UI | `src/features/chat-lab`. The thread is the Pharos chat surface, streamed from OpenAI. |
| Chat API | `api/_ai-chat-lab.ts`, with the tools `open_interface`, `write_interface` and `web_search`. |
| Interfaces | `src/features/interface-shells`. Each interface at every size is in `document/`, `search/`, `table/` or `more/`. |
| Library page | `src/features/interface-shells/interface-library.page.tsx` |
| Retrieval profiles | `interface-shells/model/shell-retrieval.ts`: descriptions, Not for lines, examples, near misses and triggers. |
| Parts | `interface-shells/model/shell-parts.ts` |
| Fixtures | `interface-shells/model/shell-fixtures*.ts`: the empty, suggestion and history content. |
| Chat formats and assistants | `interface-shells/model/chat-formats.ts` |
| Matcher | `chat-lab/model/visual-interfaces.ts` (candidates for the model) and `chat-lab/model/home-ranking.ts` (the chat home). |

To add an interface:

1. Add its kind to `SHELL_KINDS` in `shell-types.ts`.
2. Give it a component in `more/`, metadata in `shell-meta.ts`, a retrieval profile, parts and fixtures, and a place in `chat-lab/model/home-layout.ts`.
3. Add a few prompts to `home-ranking.test.ts` to check that it routes.
