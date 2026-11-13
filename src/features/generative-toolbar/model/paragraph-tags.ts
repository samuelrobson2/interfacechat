/**
 * A short tag for a paragraph, from its text: the model sees paragraphs as
 * "[3#k7f] …" and names the one it edits the same way ("@replace 3#k7f"). If
 * the number and the text don't agree, the tag finds the paragraph it meant,
 * or the edit is left out, instead of landing on the wrong paragraph.
 * (After "hashline": a position plus a content check.)
 *
 * No imports, so the API (api/_ai-toolbar-rewrite.ts) uses the same one.
 */
export function paragraphTag(text: string) {
  // FNV-1a, folded to three base-36 characters.
  let hash = 0x811c9dc5;
  for (let index = 0; index < text.length; index++) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return (hash % 46656).toString(36).padStart(3, "0");
}
