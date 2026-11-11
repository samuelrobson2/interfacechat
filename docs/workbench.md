# Workbench

The workbench is the flexible workspace chat will become: the conversation is the page, and interfaces open beside it, shrink, grow, move and wait in a strip until they're needed. Every chat thread is one. **Workbench** in the sidebar (`/app/workbench`) is a sandbox for trying layout behaviour without the model.

## On the page

- **Dots across the page.** The whole page has small dots in the UI kit's `blue-2` (#c8e9fa). The top bar is see-through like Chat's: frosted white over the dots. The interfaces sit below it, clear of the app's menu.
- **The app's menu** sits in the top-left corner, like a real menu bar; interfaces start clear of it.
- **The title** is centred in the top bar, plain, with a round picture beside it. It's the chat's title.
- **Chat's input never goes away.** It's how a person talks to every interface. With Chat open, it sits in Chat. With Chat minimized, it stays on the page, centred under the interfaces, which leave room for it. The draft and attachments carry across, and the box moves between the two places. While Chat is minimized, a reply shows for a few seconds above the input (click it to open Chat), and an interface it brings opens beside the work.
- **Chat is the page.** It has no card of its own, but it has the same bar: Highlight, the layout glyph and close (no back or forward), plus its glyph in the sidebar; large, it's the page and shows none, and its input is Chat's own (the shared prompt input, same size and placeholder). Attach, Connections and Documents sit at its bottom left; attached files show as chips until the message is sent. It is either large in the main area or a full-height sidebar on one side, and it can be minimized like anything else.
- **Interfaces** sit on white cards. The window bar shows the interface's glyph on the left (the coloured mark with no tile) and nothing else: the interface doesn't repeat it beside its title. The bar's icon lines up with the content's edge: 24px for a large layout, 16px for a card. On the right are Highlight, back, forward, history, the layout glyph and close. Close minimizes it to the top bar; nothing is ever removed. Clicking the icon lists other artifacts of that kind to open.
- **The strip** of minimized interfaces runs along the top right, ending at the **+** that opens a new interface.
- **Several of one kind.** When two or more interfaces share a kind, each app icon carries a small blue number, like an iOS badge, in the order they were opened, in the header and in the strip.
- **Highlight** is in every interface's bar, Chat's included (Chat's input stays usable while it's on). While it's on, hovering outlines a part of the interface and clicking highlights it. Chat's edit suggestions open beside it ("Make this shorter", "Ask something else"…), and the change you pick is sent to the chat. Escape clears the highlight, then turns the tool off. Minimizing turns it off too.
- **Interfaces in replies.** What you ask the chat for comes back in its reply as inline medium: a preview with no box. Click or type into it and it's selected: same size, now on a white background with an outline, so it reads as an interface, and what you see can be edited in place (text, ticks, stars, removable chips). Escape finishes editing, then puts it back inline, and it stays in the reply. On your next turn, the one you clicked into moves into its own window, a medium in the supporting column, and the reply keeps inline small pointing at it ("Open in Tracker"); clicking that rings the window. Minimize the window and the reply shows inline medium again. **Pin ↗**, on hover, moves it into a window straight away. Large is never inline.
- **Deleting.** Right-click an app icon in the top bar and choose **Delete from this session**: its window, icon and history go. Chat can't be deleted. A reply that carries what it showed keeps it.
- **Opening from the strip.** Clicking an app icon opens it as a medium at the bottom of the supporting column: the right, or the left when Chat's sidebar is on the right. Chat's icon puts Chat back where it was.
- **Moving.** Drag an interface by its header, or an app icon out of the strip. A blue outline shows where it will land, and anything the drop would minimize fades. Dropping on the top bar minimizes it.
- **The divider** between two large interfaces sets how they share the main area. Double-click it to even it out.
- **⌘Z** undoes a layout change and **⇧⌘Z** redoes it, unless a field has focus.

## Regions and sizes

| Presentation | Where | Takes |
| --- | --- | --- |
| Medium | A side column, stacked from the top | Half the column |
| Extended medium | A side column | The whole column |
| Large | The main area, left or right slot when split | Its slot |
| Chat sidebar | A side column (Chat only) | The whole column, narrower than a supporting column |
| Minimized | The strip | An app icon |

Standard interfaces offer minimize, medium, extended medium and large. Chat offers minimize, full sidebar and large.

**Free space is always used.** Sizes say where an interface belongs; it's drawn bigger when the space beside it is free, and shrinks back when something takes that space.

- With nothing large, the column holding Chat grows across the main area. Without Chat, the side columns share it.
- An interface alone in a side column takes the whole column, whatever its size.
- An interface drawn this big shows its full layout, not its card. Drops still use the regions' usual edges, so you can always drag something back into the middle.

**Capacity.** A side column holds two mediums, or one extended medium, or the chat sidebar. The main area holds two large interfaces, and only while each is at least 440px wide. When a change needs room, the least recently used interface in the way is minimized. For width, that is a large interface or a whole side column, whichever was used least recently. The interface being placed is never the one minimized.

## State and rendering

- Every interface is an **instance** with a stable ID. What it shows (its artifact and navigation) is kept apart from where it sits (layout).
- **Layout state** is, per instance: presentation, region, order within the region, last user interaction time, and where to restore it to once minimized. For the workspace it also holds the divider ratio. Region positions are the side each column is on and each slot's order.
- One **layout controller** (`applyLayoutChange`) handles opening, minimizing, resizing, moving, presets and the divider, and enforces capacity.
- A requested change and the minimizations it forces are applied as **one transaction**, so one undo restores the whole arrangement. Undo restores placement, not recency: what you last touched is still what you last touched.
- Interface state is **kept when minimized**. Frames are siblings positioned from the shared geometry, never nested in their regions, so moving, resizing and minimizing only animate a rectangle. Editors, conversations, selections, drafts and navigation history are untouched.
- The rendered layout, the strip, the drop preview and every layout glyph are **derived from the same state** (`layoutGeometry`).
- Close is minimize: an ordinary layout change, so ⌘Z brings it back.

## Back, forward and history

- Each non-chat interface has its own navigation stack and current-entry index. An entry is the artifact's ID and display title.
- **Back** moves to the previous entry and is disabled at the first. **Forward** moves to the next and is disabled at the latest.
- **History** opens a compact list of visited entries, newest first, with the current one marked. Choosing one moves the index there.
- Going somewhere new after going back discards the forward branch. Repeating the current entry adds nothing.
- Only opening a different artifact records an entry. Streaming updates, edits, focus, resizing, moving and minimizing don't.
- The scroll position is saved on the entry you leave and restored when you return.
- The stack is kept while an interface is minimized.
- Navigation history is separate from a document's edit undo, its version history and the workspace's layout undo.
- Chat has no navigation controls.

## Layout glyph and size menu

- Each visible interface has a small glyph beside its navigation controls. It's drawn like macOS window tiling: a rounded outline of the workspace, with the interface's region filled and other regions faint.
- The glyph is generated from layout state, so it shows size and position:

| Presentation | Glyph |
| --- | --- |
| Medium | A short region, top or bottom, on its side |
| Extended medium | A full-height region on its side |
| Large | Its slot in the main area, left or right when split |
| Chat sidebar | A narrow full-height region on its side |
| Minimized | A row of icons with one filled |

- Clicking the glyph opens the size and placement menu. The current size is checked. Each option has its own glyph of where it would land, and names anything it would minimize ("Minimizes Table"). Left and Right move it to the other side or the other main slot.
- Choosing an option runs the layout controller and its capacity rules.
- The button's accessible name and tooltip say where it is, as in "Document: large, right. Change layout". The diagram is never the only cue.

## Interaction and motion

- A press becomes a drag after about **6px** of movement. A finished drag never also counts as a click, so dropping an icon doesn't open it and dragging by the glyph doesn't open its menu. Escape cancels a drag.
- **Recency** is updated by the person's interaction inside an interface: pointer, keys and focus. Assistant updates don't count, so they never change what gets minimized first.
- Each frame animates between its old and new rectangle after a transaction. Minimizing, including automatic minimizing, shrinks the frame toward its actual app icon in the strip.
- Animations never block state or input. A new transaction retargets an animation in flight, and reduced motion turns them off.

## Where it lives

| What | Where |
| --- | --- |
| Sandbox page | `src/features/workbench/workbench.page.tsx` |
| Surface (shared with Chat) | `workbench/ui/workbench-surface.tsx` |
| Chat's threads | `src/features/chat-lab/chat-lab.workspace.tsx` and `chat-lab/model/chat-lab-workbench.ts` |
| Layout controller | `workbench/model/workbench-layout.ts` |
| Geometry and drops | `workbench/model/workbench-geometry.ts` |
| Navigation stacks | `workbench/model/workbench-navigation.ts` |
| State (instances, artifacts, navigation, layout and undo) | `workbench/model/workbench-store.ts` |
| Frame, glyph, menus, strip and divider | `workbench/ui/` |
| Chat's tools (Highlight, Connections, Documents) | `src/shared/ui/kit-additions/chat-tools.tsx`, shared with Chat |
| Tests | `workbench/model/_tests_/` |

The chat on the sandbox page is a stand-in. What you send is routed with the same matcher as Chat, and the kind it picks comes back inline in the reply. In a real thread the model decides; see "In a thread" in [chat-and-interface-library.md](chat-and-interface-library.md).
