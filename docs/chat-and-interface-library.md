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

## Choices while you type (Document, Table, Tracker and Search)

While a request is typed on the chat home and the Document card is open, `/api/prompt-choices` works out the few things the result would otherwise guess (who it's for, what it should do, its form, what it covers) and shows them inside the medium plus card, in its body (the `brief` suggestion place), where "Add additional context" used to be: at most three, and none when the request is already clear. While they're worked out, "Working out what to ask…" and shimmering rows show where they'll land; once there, a guess shimmers while it's being updated. Each is a question and what it holds now: the model's guess, in the AI colours, until it's picked. Picking an option adds a phrase to the prompt, all in one sentence after the request ("For the launch team, covering the timeline and risks."), so the prompt gets better and stays the record of what was asked; the title stops at the first sentence, so the brief never lands in it. Like the toolbar, the choices are a keyed table the model updates with changes only, and each carries scores (impact, and how far the request already says it) that decide what shows (`chat-lab/model/prompt-choices.ts`). The route's `FORKS` lists what usually varies per interface (Document: audience, purpose, form, coverage; Table: what a row is, columns, scope, count; Tracker: goal, deadline, owners, grouping; Search: angle, time, sources, place), and the model asks only from its own interface's list. Each choice also takes their own words: "Something else" in its popover, read into the prompt through the choice's template ("for {}", "from {}"). In Table they sit above the columns; in Tracker and Search, where the empty rows or results would be. Where an interface has parts to fill, the suggestions go straight into them instead of being asked about: a Table's columns, a Search's filters, a Tracker's first items come back as `fills` and show in the medium plus card, outlined among the real ones (`SuggestedChip`, `SuggestedItem`), for one-click adding; a Table's column names are the exception: per the rule below. A Search filter with no wording of its own is written into the prompt as one clause ("…, filtered to Past year and Reviews") that reads back as filters; columns as "with columns for …"; checklist items stay on the card. Document's medium plus title can run to two lines before it's cut.

**What gets suggested is set by the kind of part, not by interface** (`interface-shells/model/suggestion-parts.ts`, read by the card and the route). Each P0 interface lists its parts, each one of four kinds:

| Kind | Rule | Examples |
| --- | --- | --- |
| question | Shown at once as a choice with the model's guess; updated as they type | Document's audience, Guide's servings, Dashboard's measures |
| collection | Shown at once, outlined among the real ones; one click adds | Search filters, Tracker items, Schedule constraints |
| slot | Nothing until they type in it, then the matches (`typeahead`) | Table column names |
| default | The guess sits in the field itself, in the AI colours, until changed | Document length |

A new interface only lists its parts. Chat has none: its format and assistant are already guessed from the prompt.

**Rule: suggestions inside a field wait for typing.** A field the person names themselves (a Table's column header) shows nothing until they start typing in it; then `typeahead` (`ui/suggested-chip.tsx`) offers the suggestions that match what they've typed, words starting with it first, in a list under the field. Use it for any new in-field suggestion.

## The design system

Every interface is built from the same parts: **frame** (the surface), **title** (glyph and title on the shared edge), **tools** (standard, then AI, on one row), **body** (the interaction area), **meta** (the detail line) and **suggest** (chips and choices). Their spacing, type and radii come from tokens, not from each interface:

- `interface-shells/design/shell-tokens.json` holds them in the W3C Design Tokens format: scales (`space`, `type`, `radius`) and, per size, a token for each part's padding, gap, type and so on, which may point at a scale step (`{space.4}`).
- `ShellSurface` turns them into CSS variables (`--shell-title-padding-x`, `--shell-body-gap` …) for the size it's drawn at. The building blocks read them: `SHELL_TITLE_ROW`, `SHELL_TITLE_TYPE`, `SHELL_TITLE_GLYPH`, `SHELL_BODY_BOX` and `CONTENT_PANEL` in `ui/shell-kit.tsx`, plus `ShellTitle`, `ShellBody`, `ShellDetail`, `ShellToolbar` and `SuggestedChip`. An interface fills the parts and never sets its own padding, type size or radius.
- `SIZE_ANATOMY` (`design/shell-tokens.ts`) says which parts each size shows: small is the glyph; medium the glyph and title and a glance at the content; medium plus adds the detail line and suggestions; large has everything; inline drops the frame and tools.
- **Design System** page (`/design-system`): pick a size, change any part's tokens from the menu, and every P0 interface updates live, editable, with real content; pointing at a part outlines it. Compare sizes shows one interface at each size. Review lists what changed; Save writes the token file (dev only, through `vite-plugins/dev-tokens.ts`, which can only change values). The Spec tab is the generated reference.
- **Undo and remove**: ⌘Z / ⇧⌘Z undo and redo token edits (a drag is one step; typing inside an interface keeps its own undo). Each size has a `visible` token for its title, tools, interaction area, detail line and suggestions: Remove (in the menu, or on the inspector's tag) takes that part out of every interface at that size, and Restore brings it back. The surface lists removed parts in `data-hide-parts`, and index.css hides them.
- **Inspect** (on by default): hover any part of an interface to see its padding (green) and margins (orange) with their values and tokens; drag a side to change its token (snapping to the spacing scale); click a part to open its controls in the menu (`design/padding-inspector.tsx`).
- Medium plus has the same anatomy as large: title, then the toolbar (`ShellToolbar`, sized by the tokens), then the interaction area. Every P0 interface shows its standard tools there, except the few that only work at large (Reader's zoom and selection tools, Guide's cook mode, Generator's Generate, Dashboard's refresh). Medium plus shows the title alone: no subtitle or description under it (Table's description waits for large).
- Medium has no tools: the glyph and title, then one glance of the content. A click opens it at medium plus, where the tools are.
- At medium and medium plus the tools sit inside the interaction area's panel, at its top with a line under them (the rule is in index.css, keyed on `data-shell-size`, so every interface follows it). The panel has a 0.5px outline (`body.border-width`, `body.border-color`).
- Colours come from the `color` roles in the tokens, never one-off greys: `bg-shell-panel` (panels, menus), `bg-shell-frame` (the medium and medium plus card), `bg-shell-fill` (controls, chips, fields), `border-shell-line` (dividers), `border-shell-line-strong` (outlines that must be seen), `shell-outline` (the panel's outline), `bg-shell-ink-faint` / `bg-shell-ink-soft` (placeholder ink). Text stays `text-typography-primary` / `-secondary`. Status and category colours (red, orange, the folder pairs) stay as they are. The roles' defaults are on `:root` in index.css; a test keeps them equal to the tokens.
- Adding happens in the toolbar; showing happens in the body. The settings that shape an interface (Search's filters and sites, Guide's facts, Schedule's days, start and hours) show as chips at the top of the body, where they can be changed or removed, but there's no "Add a …" chip there: the toolbar has the add (`ShellToolPopover` + `ShellToolField` with `suggestions`).
- Document and Article are one interface. A Document can carry live pieces between its paragraphs: `datasets`, `variables` and `blocks` (stats, charts, tables, controls, code), the same parts a Dashboard uses, each placed in the body by a line of its own, `::id` (`EMBED_LINE` in `model/markdown-blocks.ts`). The editor draws them with the dashboard's block views (`document/document-embeds.tsx`); a `{{id}}` naming a variable shows its current value in the sentence. Its toolbar adds two tools to the usual formatting: Insert (stat, chart or table, over the first dataset, after the line being edited) and the Data menu. The model writes them through `fill_document` (optional `datasets`, `variables`, `blocks`), and patches a piece with `update_interface`. In a chat, a document keeps its pieces on the artefact (`pieces`). Requests for an interactive article, a data story or an explorable explanation open a Document.
- Suggestions (the Design System page's Generative state). The principles: a suggestion is the thing itself, in the exact form of what it would become, where it would go (a checklist item is a checklist row, a schedule line is a line with its bar, a column is a header with its cells, writing is writing); it can be whole content (a sentence, a step, a line, a column), not just a value; two marks only: its words in the suggestion gradient (`text-gradient-suggest`, every stop 4.5:1 or better) and the control it would get (a checkbox, a tick, a chip's edge) outlined in violet (`SuggestedBox`) or, for chips, the AI outline (`SuggestedChip`); drawn content that isn't words shimmers (`shell-suggest-shimmer`, still under reduced motion); it goes inside the content where it belongs: a `Suggestion` can name the item it follows (`after`) and its group (`group`), and `suggestionsAfter` draws it there in every interface (a checklist item in its section, a step between steps, a schedule line after its task, a sentence after its paragraph); one that names nowhere goes at the end of its list; in an empty list suggestions fill the placeholder rows in order, with their numbers, and only the rest stay placeholders (`ghostsAfter` in ui/shell-accents.ts); using it (click or Enter on its words, `SuggestedText`) accepts it and it becomes ordinary content; × on hover dismisses it (`DismissSuggestion`). Medium plus and large only. Generated tools run as chips in the toolbar's own row after the standard ones, at medium plus and large (never folded into a group); the row scrolls when it's longer than the toolbar, gliding when the pointer reaches either end (`ToolRow` in shell-toolbar.tsx); or they sit beside the part they act on (`placeOf`, at most `PER_PLACE`), never in Document's word count. The page uses the toolbar lab's rules engine (`@/features/generative-toolbar`).
- Card sizes are tokens (`frame.width`, `frame.height` per size in shell-tokens.json); `SHELL_DIMENSIONS` reads them, so the chat home, the library and every page follow. Now medium 128 × 128, medium plus 320 × 244, large 760 × 540. They're editable on the Design System page: drag a card's corner handle (snaps to 2px; arrow keys nudge, Shift for 10) or type them under Frame, then Review changes › Save. Set `CARD_SIZES_LOCKED` to true on that page to lock them again.
- Standard tools are the core few (spec: "Standard tools are the core few"): copying, exporting, clearing and bulk adjustments were taken out of every toolbar; Document has no Data menu (data comes in through the chat; Insert places it). Toolbar text is `tools.font-size`, 11px at medium plus and 13px at large, editable under Tools on the Design System page.
- Arriving on the chat home, "Welcome back, Samuel!" fades in (`FadeText`, `compose/fade-headline.tsx`) while every tile waits hidden in the centre (`HELD`); as soon as it reads, they leave it one at a time (75ms apart), the ring round the headline first, then the outer ring, each clockwise from the top left (`LAUNCH_ORDER`, `SPIN_OUT` in `home-field.tsx`). Typing into the composer first releases them at once; the prompt box fades in with them (`onRelease`). The icon by each title stays still. The glyphs (the shapes in the interaction area: every `Bar`, marked `data-shell-ink`, or the body's own pieces where it draws none) draw themselves in as the tile lands, one after another; on hover the whole card lifts (up 4px, a touch larger, a deeper shadow) and the glyphs ripple along. Only position and scale move, never colour (`home-field.css`). Reduced motion skips all of it.
- While the chat home is idle (settled after the intro, nothing typed), the interfaces round the headline take turns peeking: one at a time grows to medium plus where it stands, filled with its suggestion fixture and headed with the request that would make it (its title; Search's query; Chat's message), which types itself in quickly, then its sections (the toolbar, then each block of the content area) fade up one after another, top to bottom, each to its own colour (`PeekShell`) (7s each, 1.8s between, never the same twice running; it waits while the pointer is on it). Clicking it makes that request the prompt and opens the card (`field.tryPrompt`). Once they type anything, the examples stop for good. The requests are hard-coded in `chat-lab/model/home-peeks.ts`. Off under reduced motion.
- On the chat home, a detected interface opens at medium plus at once (no hint state). The request is never rewritten: card edits stay on the card (`extras`), and choices (select and deselect, none picked to start) make a brief that goes with the interface as first-turn context (`brief` on the session, read in `chatModesForRequest`). Once typing pauses, `/api/interface-title` names the card in a few words and, for Guide and Schedule, returns its first steps, which arrive one by one as suggestions (`useInterfaceName`). Guide reads its facts from the request (`guideFacts`: time, people, diet/level/style keywords); Serves and Time are standard controls whose guess (the `serves` and `time` defaults from `/api/prompt-choices`) sits in them in violet until set.
- Accessibility (WCAG 2.2 AA) is part of the spec (`SPEC_RULES` in `design/shell-tokens.ts`, on the Spec tab): text 4.5:1 (secondary text is the `text-secondary` role, #6b6b6b, scoped to interfaces in light theme; grey 3 is only 3.8:1 on fill), targets 24px or more (small ticks sit in a 24px button), every control named, every tool with a tooltip (`ShellTooltips`, mounted in the app: hover pause, at once on focus, disabled tools too), scroll areas focusable, visible focus, no control inside a control. Enforced by `design/_tests_/accessibility.test.tsx` (contrast of every colour role, type sizes, axe on every interface at medium, medium plus and large, source rules), so a new interface must pass it. Checkbox and tick outlines use the `control` colour role (#8a8a8a, 3:1). Type: each size has content, small and reading sizes as tokens (`body.font-size`, `meta.font-size`, `body.reading-size`), and a CSS ramp in index.css snaps any size written into an interface onto them; toolbars use `tools.font-size`, Regular.
- One line on the left: the title's glyph, the first tool's icon and the content all start on `layout.edge`. At medium and medium plus that's the panel's inset plus its padding (medium 6 + 6 = 12, medium plus 8 + 12 = 20; the tools' padding plus a tool's own 8px makes the same). At large the table's lines and row numbers start there too. The Design System page's Check (`design/layout-check.ts`, drawn by `layout-check-overlay.tsx`) measures it deterministically: rows on the left keyline, nothing past the right keyline or hanging out of its part, no overlapping siblings, and anything outside the parts on the keylines; it must report nothing at every size and state. Its Guides draw it (`design/layout-guides.tsx`), as design tools do: margins (both keylines, solid, with a band), the panel's edge (dashed, apart from the keyline), rows (each part's top and bottom with its height), the readable width at large (680px of text) and a 4px grid.
- A grid on medium plus sits in the panel with room on every side, in its own rounded box that clips it, and scrolls sideways inside that box. Its rows keep their height: when something sits above it (the choices on the chat home), the panel scrolls rather than squeezing them.
- Every size has one **edge** (`layout.edge`): the title and the detail line start on it, so it's set once. Titles at each size use one type (`shell-title-type` in index.css): 12px on medium tiles, 14px on medium plus, 22px at large, 15px inline. An empty title keeps the title's weight (Book), in the secondary colour.
- Covered: medium, medium plus, large and inline (small is the glyph on its tile). Every P0 interface is on the page, Chat last; Chat has no large, so it's left out there.
- Chat follows the anatomy like the rest: medium is the glyph and title, then a message bubble and a reply as bars in the panel; medium plus is the title, the toolbar when there are tools, then Format, Assistant and the message in the panel.
- At medium plus a card's shadow is a light version of its border colour (index.css, `[data-shell-tint][data-shell-size="medium-plus"]`).
- At medium and medium plus every card has a border in its interface's colour, from the `tint` tokens in shell-tokens.json: per interface a `border` (its app icon's tile colour; Notes, Generator and Dashboard borrow another's icon with a hue shift, so theirs is that tile after the shift) and one `width` (0.5px). The card's grey, its title and its icon stay as they are. `InterfaceShell` passes the kind down (`ShellKindContext`); the surface (`tintOf`) sets `--shell-tint-border` and `--shell-tint-width`, and `[data-shell-tint]::after` in index.css draws the border over the card, so nothing inside moves. On the Design System page, at Medium or Medium plus, **Interface colours** edits each border colour (picker or hex) and the width; it saves with the other tokens. (White versions of the icons, `*-glyph-white.png`, cut from the app icons, are in the assets folder but not used.)

## Sizes and states

Every interface is the same object at four sizes.

| Size | Where it appears | What it shows |
| --- | --- | --- |
| Small (S) | App icon | A white 3D glyph on a solid coloured tile. |
| Medium (M) | A tile on the chat home | The blank interface, named after its kind ("Document", not "Untitled"). Chat at M is just a bubble holding the query. |
| Medium plus (M+) | The card while you type | Every field is editable. ⌘↵ sends. |
| Large (L) | A window in the thread | The working interface, with room to edit. It shows its glyph beside its title, like every size. Everything starts on one 24px edge, the same as the bar's icon: the title (with little space above it), toolbars, content and footer. Document's footer is just the word count. The key functions also appear at M+ and M. Diagram opens as a FigJam-style board: pan, zoom, a tool bar, and a small bar of options above whatever is selected. |

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

**Generated tools in the app.** Every interface at medium plus and large gets its generated tools from one hook, `useInterfaceGenerative` (`generative-toolbar/ui/interface-generative.tsx`): a chat's windows, the chat home's open card and the Design System page's Generative state all use it, so what's tried on one is what the others show. It asks `/api/toolbar-tools` for tools once the content settles (and again when it changes, or text is selected in it), places each where `placeOf` says (the toolbar after the standard tools, or beside the part it acts on), and runs one in place when the client can, otherwise through `/api/toolbar-run` (a Document through `/api/toolbar-rewrite`), streaming the edits in, with a note and Undo over the interface's foot. A Document's filled blank is followed up the same way. Medium has no toolbar, so none; nothing is asked while the model is writing to the interface. One switch, **Tools: Model · Rules · Off** (on the Design System page, kept per browser), sets the source app-wide; with Model, the rules still fill in if the model can't be reached.

**Generated suggestions** (the Generative Tools page, `/app/generative-tools`) come in two kinds, and neither gets a row or a panel of its own:

- **Suggested values** sit among the real ones with the AI outline, as `SuggestedChip`: a filter among Search's or Map's filters, a tone, style or length among Generator's, a constraint among Schedule's, a ghost column at the end of a Table, an outlined item in a Tracker's first list, a note on a Moodboard canvas. Click to add; × to dismiss. They reach a shell as `suggested` (`SuggestedValues`); the page's stand-in is `generative-toolbar/model/suggest-values.ts`.
- **Suggested tools** (chips, sliders, 2×2s, choices, toggles) go in the toolbar after the standard tools, or inside a row the interface already has (`SUGGESTION_PLACES`): Schedule's day settings, Generator's prompt box, a Diagram's or Moodboard's board. Defaults are in `generative-toolbar/model/tool-places.ts`; a tool's own `place` wins.

**How generated tools are made and run** (P0 interfaces; the page's **Tools from** switch picks Model or Rules):

1. **The table.** The toolbar keeps every tool suggested for the interface in a table, one row per key (`generative-toolbar/model/tool-table.ts`). Each tool carries three scores from the model: impact (1 to 5, how much using it would improve the content now), fit (0 to 1, how well it suits what's there) and done (0 to 1, how far the content already does it). What shows is worked out in the browser: the best few by `impact × fit × (1 − done)`, above a floor, drawn in the order they arrived. A re-scored tool can leave the bar, but the rest keep their places.
2. **Updating it.** After an edit pauses, `/api/toolbar-tools` gets the interface's data (pictures as `[image]`), the table, the standard tools (`standard-tools.ts`) and a short list of what changed since the last look (`describeChanges`). It answers with changes only, streamed one per line: keys to drop, fresh scores, and tools that are new or changed under their key. Each is merged as it arrives, so tools appear one by one and a changed tool updates in place. It runs with reasoning off: the first tool lands in about 1.5s. A one-off action that's been used ("Name 3 columns") is done, so it goes (`spendTool`): it counts as dismissed, so the model won't offer it again, and Undo brings it back (`restoreTool`). A setting that's been used (a slider, a toggle, a choice) is pinned at its value: the model can't change or drop it. Regenerate clears every unpinned tool and asks for others. If the model can't be reached, the rules fill the table.
3. **Running a tool.** A rules tool with `apply` changes the data on the spot. On a Document, any other tool goes to `/api/toolbar-rewrite`, which streams edits to numbered, tagged paragraphs (`@replace 3#k7f`, `@after 7#q2m`, `@delete 2#a0c`). The tag is a short hash of the paragraph (`paragraph-tags.ts`): an edit whose number and tag disagree goes to the paragraph the tag names, or is left out, never onto the wrong one. Paragraphs it doesn't name stay exactly as they are, so nothing is lost by being left out, and the body changes in place as it streams. On the other interfaces, `/api/toolbar-run` streams slash-path edits, each applied as it arrives and checked by `applyOperations`; list items are named by id where they have one (`/items/h3/done`), so an edit can't land on the wrong row. A tool that checks or explains answers in a reply instead. Undo puts back the data as it was.

**What the chat model keeps in context.** Only the latest version of each interface. The open interface's current contents go at the end of the prompt, after the conversation, so everything before them stays a cacheable prefix while it changes. Earlier fills (`fill_document`, `fill_table`, `write_interface` …) keep their call and short result, but their content is replaced by a fixed note (`chat-lab/model/artifact-history.ts`); small edits (`update_interface`) stay as they are.

**Blanks** (Document, on the Generative Tools page for now). When a tool writes something new, the model leaves a blank wherever it would otherwise make something up: how many guests, a budget, how long the trip is. A blank is a `{{key}}` slot in the body, with its question, options and placeholder in the Document's `blanks`. Empty, it shows its placeholder in the AI colours (`text-gradient-ai`); clicking opens its question, answers to click and a field for their own words. An opening that depends on such facts asks them first and stops. Once every blank left by that run is answered, `blankFollowUp` asks the rewrite to finish what was asked and rewrite what depends on the answers; the slots stay, so an answer can be changed later and the writing follows again. Copy, download and `resolveBlanks` read a slot as its answer, or "…" while it's empty.

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
