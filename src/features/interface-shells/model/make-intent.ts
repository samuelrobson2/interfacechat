/**
 * When a turn asks for something to be made. Read by the chat API, which then
 * opens an interface on the first step instead of leaving it to the model, and
 * by the app, which reads the turn the same way to find what could be made.
 * Imports nothing, so both can use it.
 *
 * A turn asks to make something when:
 * - it says so: "Make the menu", "Can you draft a brief", "Now give me the recipe";
 * - it asks for something to be put in an interface: "add these to interfaces",
 *   "put that in a list", "turn it into a document";
 * - it agrees to something the assistant offered to make: "Next I can draft a
 *   menu, then a shopping list" → "Yes sounds good, can you do both?".
 */

/** A plain request to make something: "Make the menu", "Now give me the recipe", "Can you draft a brief". */
export const MAKE_REQUEST =
  /^\s*(?:(?:ok(?:ay)?|now|then|and|great|thanks|yes|sure)[,!.]?\s+)*(?:(?:please|can you|could you|would you)\s+)?(?:make|create|build|write|draft|give me|put together|generate|draw up|plan out|set up|add (?:a|an|another))\b/i;

/** Asking for something to go into an interface: "add these to interfaces", "put that in a list", "turn this into a doc". */
const INTO_INTERFACE =
  /\b(?:add|put|turn|move|make|save|write)\b[^.?!]*?\b(?:into|in|to|as|on)\s+(?:an?\s+|the\s+|its own\s+|their own\s+|separate\s+)?(?:interfaces?|documents?|docs?|lists?|checklists?|trackers?|tables?|spreadsheets?|guides?|recipes?|schedules?|plans?)\b/i;

/** Agreeing: "Yes", "Sounds good", "Go ahead", "Please do". */
const ASSENT = /^\s*(?:yes|yeah|yep|yup|sure|ok(?:ay)?|sounds (?:good|great)|perfect|great|go (?:ahead|for it)|please do|do it|let'?s do (?:it|that|both|them)|that works|both|all of them)\b/i;
/** Taking up more than one, or the one offered: "can you do both?", "do them all", "do that". */
const TAKE_UP = /\b(?:do|make|want|need)\s+(?:both|all|them|it|that|those|these)\b/i;
/** The assistant offering to make something: "I can draft a menu", "Want me to turn it into a shopping list?". */
const OFFER =
  /\b(?:i can|i could|i'll|i will|shall i|want me to|would you like me to|should i|happy to|next,? i can)\b[^.?!]*\b(?:make|create|build|write|draft|put together|turn|draw up|plan|set up|map out|list|sketch|outline)\b/i;

/**
 * Why this turn asks for something to be made, or null when it doesn't. `previous` is the assistant's message it answers.
 * - request: it says to make something ("Make the menu"); that may not need an interface ("Write me a haiku").
 * - into: it asks for an interface ("add these to interfaces").
 * - offer: it agrees to something the assistant offered to make.
 */
export function makeIntent(text: string, previous?: string): "request" | "into" | "offer" | null {
  if (INTO_INTERFACE.test(text)) return "into";
  if (previous && OFFER.test(previous) && (ASSENT.test(text) || TAKE_UP.test(text))) return "offer";
  if (MAKE_REQUEST.test(text)) return "request";
  return null;
}

/** Does this turn ask for something to be made? */
export const asksToMake = (text: string, previous?: string) => makeIntent(text, previous) !== null;

/**
 * The interfaces any turn can make, whatever retrieval finds: the everyday
 * ones that hold what a reply would otherwise write out (something to read, a
 * list to tick off, rows to compare, steps to follow, a timed plan). Library
 * ids. Retrieval ranks what fits this turn first; these are always there too,
 * so a turn that refers back ("do both", "add these") can still make them.
 */
export const ALWAYS_MAKEABLE = ["document", "checklist", "table", "guide", "schedule"] as const;
