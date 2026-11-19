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
  /\b(?:i can|i could|i['’]d|i would|i['’]ll|i will|shall i|want me to|would you like me to|should i|happy to|let me|we can|we could)\b[^.?!]*\b(?:make|create|build|write|draft|put together|pull together|come up with|suggest|turn|draw up|plan|set up|map out|list|sketch|outline)\b/i;

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

/** The things an offer names, each where it sits in the text: "a tighter shoot schedule", "a shot list". */
export type OfferedThing = {
  /** What to make, as said: "a tighter shoot schedule". */
  thing: string;
  /** Where its words start and end in the text, without the article ("tighter shoot schedule"). */
  start: number;
  end: number;
};

/** The verb an offer makes things with, then what follows it: "turn this into …", "draft …". */
const OFFER_OBJECT =
  /\b(?:i can|i could|i['’]d|i would|i['’]ll|i will|shall i|want me to|would you like me to|should i|happy to|let me|we can|we could)\b[^.?!]*?\b(?:make|create|build|write|draft|put together|pull together|come up with|suggest|turn (?:this|that|it|them|these|those) into|turn|draw up|plan|set up|map out|sketch|outline)\s+([^.?!]+)/gi;
/** Where a thing's name ends: what follows is about it, not part of it ("for next week", "so the day runs on time"). */
const THING_END = /\s+(?:for|so|to|that|with|from|based|next|if|by|in|on|when|which|you|too|as well|instead)\b.*$/i;
const ARTICLE = /^(?:a|an|the|your|a quick|a full|some)\s+/i;
/** A part that starts with its own verb: "then turn it into a shopping list", "make a schedule". */
const LEADING_VERB = /^(?:then\s+|also\s+)*(?:turn (?:this|that|it|them|these|those) into|make|draft|build|write|create|put together|do|add)\s+/i;

/**
 * What an offer names, so each can be made with a click. Read from the
 * assistant's own words: "If you want, I can turn this into a tighter shoot
 * schedule or a shot list next" names a tighter shoot schedule and a shot list.
 */
export function offeredThings(text: string): OfferedThing[] {
  const found: OfferedThing[] = [];
  for (const match of text.matchAll(OFFER_OBJECT)) {
    const object = match[1] ?? "";
    const objectAt = (match.index ?? 0) + match[0].length - object.length;
    // One or several: "a menu and a shopping list", "a schedule, a shot list or a call sheet".
    let cursor = 0;
    for (const part of object.split(/,\s*(?:and\s+|or\s+)?|\s+(?:or|and|then)\s+/)) {
      const at = object.indexOf(part, cursor);
      cursor = at + part.length;
      const lead = part.match(LEADING_VERB)?.[0].length ?? 0;
      const name = part.slice(lead).replace(THING_END, "").trim();
      const bare = name.replace(ARTICLE, "");
      // A thing has a name: "plan it around five setups" says how, it doesn't offer anything, and what follows
      // ("with the product shots first") belongs to that clause, not to a list of things.
      if (!bare || bare.split(/\s+/).length > 5 || /^(?:it|this|that|them|these|those|one|something|anything|everything|with|for|so|to|while|because|from|on|in|at|by)\b/i.test(bare)) break;
      const start = objectAt + at + lead + (name.length - bare.length) + (part.slice(lead).length - part.slice(lead).trimStart().length);
      found.push({ thing: name, start, end: start + bare.length });
    }
  }
  return found;
}

/** Words that ask for something: with none of these and no question, a message only tells. */
const ASKING = /\?|\b(?:make|create|build|write|draft|give|show|need|want|help|plan|add|put|turn|find|search|look up|list|suggest|recommend|change|move|remove|swap|can you|could you|would you|please|let['’]?s|do|tell|explain|compare)\b/i;

/**
 * A message that only gives facts ("8 of us, one vegetarian, Saturday at 7pm"):
 * no question and nothing asked for. It's noted, and it can change what's open,
 * but it never makes something new: nobody asked for anything.
 */
export const onlyTells = (text: string) => Boolean(text.trim()) && !ASKING.test(text);

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
