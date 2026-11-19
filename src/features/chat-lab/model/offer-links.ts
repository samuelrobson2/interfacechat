import { offeredThings, type ShellKind } from "@/features/interface-shells";
import { interfaceForThing } from "./visual-interfaces";

/** A clickable offer's address: what to make, as which interface. Never a real link. */
const PREFIX = "#make:";

/**
 * A reply with what it offers to make turned into links the chat draws as
 * buttons ("If you want, I can turn this into a tighter shoot schedule or a
 * shot list next": each thing, with its interface's icon, makes it on a
 * click). Only things an interface the chat makes clearly fits; the rest of the
 * words are left exactly as written.
 */
export function withOfferLinks(text: string): string {
  let out = "";
  let at = 0;
  for (const offer of offeredThings(text)) {
    const words = text.slice(offer.start, offer.end);
    const plain = words.replace(/\*+/g, "").trim();
    const kind = plain ? interfaceForThing(plain) : null;
    if (!kind || offer.start < at || /[[\]()]/.test(words)) continue;
    out += `${text.slice(at, offer.start)}[${plain}](${PREFIX}${kind}:${encodeURIComponent(offer.thing.replace(/\*+/g, "").trim())})`;
    at = offer.end;
  }
  return out + text.slice(at);
}

/** A clickable offer read back from its address: the interface, and the request a click sends. */
export function readOfferLink(href: string | undefined): { kind: ShellKind; request: string } | null {
  if (!href?.startsWith(PREFIX)) return null;
  const [kind, thing] = href.slice(PREFIX.length).split(":");
  if (!kind || !thing) return null;
  return { kind: kind as ShellKind, request: `Make ${decodeURIComponent(thing)}` };
}
