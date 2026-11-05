# Chat home: how an interface activates

This doc covers the empty chat home (`/app/chat-lab`) before the first message is sent. Once a thread has started, the model chooses interfaces, as described in [chat-and-interface-library.md](chat-and-interface-library.md).

On the home, choosing an interface is instant and in your hands. As you type, the interface that fits comes to the middle and fills itself from the prompt. Editing the card rewrites the prompt, and typing refills the card. Whatever is in the middle when you send is exactly what opens.

## The field

- **Every interface has a fixed place.** Six sit around the headline ("Welcome to a new type of AI"): Chat, Document, Search, Table, Tracker and Guide. The other eight wait just past the edges. The places are defined in `chat-lab/model/home-layout.ts`.
- **Tiles never rearrange.** The page pans to a tile instead of moving tiles to the middle.
- **Only the interfaces are shown.** Suggestions and past work are kept off the field for now, to keep the page calm.
- **Blank tiles show their interface's name,** such as Document or Schedule, rather than "Untitled".
- **You can drag the page** to explore. A drag never opens a tile.

## States

| State | What you see | How you get there |
| --- | --- | --- |
| Resting | The headline and the tiles in their places. | The draft is empty. |
| Hinted | The page pans so the recognised tile sits in the headline's place, at medium size with a ring. The headline fades, so it's clear the prompt is being captured. | The interface is recognised, but the draft doesn't yet say what it's about: "Write a paper", "Build a schedule". |
| Suggested | The tile grows to medium plus where it stands and fills from the prompt. The other tiles dim. | The draft adds detail: at least two distinctive words beyond the ones that named the interface ("…on coral reefs"). |
| Chosen | The same as Suggested, but locked, so typing no longer swaps the interface. | You clicked a tile or edited a field on the card. |
| Dismissed | Nothing grows to medium plus. | You pressed × or Esc. |
| Starting | The card morphs to large and docks beside the new thread, and everything else fades. | You sent. |

Two things reset these states:

- **Clearing the draft returns to Resting** and clears both the lock and the dismissal.
- **Rewriting most of the draft releases the lock.**

## Matching

- **It runs on every keystroke, synchronously,** with no debounce, network call or model, so the field reacts on the same frame as the word.
- **It matches whole words only.** "pap" does nothing, but "paper" brings Document forward.
- **Each interface is scored against its trigger words, description and example queries,** all of which you edit in the library. A draft that reads like a near miss loses score.
- **A challenger must win twice.** A close runner-up only takes over if it stays ahead for two keystrokes in a row or pulls clearly ahead. Ties never take over.
- **Chat can lead too.** A greeting or a quick question brings the Chat card forward, and sending it opens an ordinary thread. A query that implies a format or an assistant ("pros and cons", "be honest…") fills Chat's Format or Assistant field.

## The prompt and the card are one text

The prompt is the source of truth, and the card is a structured view of it. Small deterministic parsers (`chat-lab/model/prompt-fields.ts`) read each field from a span of the prompt and remember where the span is.

| Interface | Field | Read from |
| --- | --- | --- |
| Document | Title, length, context | "Write a paper on **urban heat islands**, **~1,500 words**, **covering** …" |
| Search | Query, sources, filters | The topic, domains such as "**scholar.google.com**", and phrases such as "**since 2020**" or "**peer-reviewed**". |
| Table | Title, columns, rows | "a **shot list** with **framing, cast and equipment**", "for each **shot**", "**10 rows**" |
| Chat | Format, Assistant | Cues such as "pros and cons" or "critique". |

Edits flow both ways:

- **Prompt to card.** Typing refills the fields. Empty fields keep their grey prompts.
- **Card to prompt.** Editing a field rewrites its span, so retitling the card to "urban cooling" makes the prompt "Write a paper on urban cooling". A field with no span yet adds one in the interface's own words (", about 1,500 words"). Removing a value removes its span.
- **Choosing a different tile keeps the topic.** The prompt is reworded into the new interface's form: "Write a paper on urban heat islands" becomes "Search for urban heat islands". On an empty draft, a click seeds the composer, for example with "Write a paper on ".

## Sending

- **Enter in the composer, or ⌘↵ in the card, sends.**
- **A Suggested or Chosen card opens directly.** The model receives the prompt and the card's fields, and doesn't re-pick.
- **A Hinted or Dismissed card, or no match at all, sends plain chat.** The model can still open an interface from its candidates.
- **The card's content is frozen during the handoff.**

## Motion

The aim is for the home to feel like the same page the whole time.

- Panning is unhurried, using a spring with stiffness 110 and damping 22.
- Growing in place uses a spring with stiffness 300 and damping 26.
- When a card takes the middle, any drag is undone so the card really is centred.
- With reduced motion on, everything moves without animation.

The design takes several cues from [shapeshift](https://github.com/anishfn/shapeshift):

- a hint before committing;
- a challenger having to win twice;
- a pick that holds until the draft is mostly rewritten;
- code, not the model, filling the fields;
- its spring values.

## Where tiles come from

The field reads tiles from **sources**: functions that return tiles. The ranking never knows where a tile came from, so each source can be replaced with a real one without touching the field.

| Source | Gives | Today | Later |
| --- | --- | --- | --- |
| Library | A blank tile per interface | `SHELL_KINDS` | The interface registry |
| Suggestions | Suggested tiles (not shown on the field) | Shell fixtures | Generated for this person |
| Past work | A history tile per past chat, and a group for chats that used several interfaces (not shown on the field) | Demo threads in the chat store | Real chats |

Ranking (`chat-lab/model/home-ranking.ts`) is a pure function. It takes the tiles, the draft and the previous result, and returns the order and the leader.

## Code

| File | Role |
| --- | --- |
| `chat-lab/model/home-tiles.ts` | The tile sources. |
| `chat-lab/model/home-ranking.ts` | Ranking, with hint and commit thresholds and the win-twice rule. |
| `chat-lab/model/home-layout.ts` | Fixed places, and `panTo`. |
| `chat-lab/model/prompt-fields.ts` | Keeps the prompt and the card in sync. |
| `chat-lab/model/use-home-field.ts` | The home's state. |
| `chat-lab/compose/home-field.tsx` | The field: pan, drag, ring, grow and dismiss. |

## Not built yet

- Pressing Tab to move from the composer into the card's first field.
- Flashing the changed words in the prompt, and fading new values into the card.
- Bringing suggestions and past work back onto the field.
- Matching by meaning with a small in-browser embedding model, for when keywords miss too often. It would only change the ranking and would never move a Chosen card.
