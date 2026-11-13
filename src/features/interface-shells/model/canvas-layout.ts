import { svgUrl } from "./canvas-ai";
import type { MoodboardItem, MoodboardShellData } from "./shell-types";

/** Default widths on the board, in board units. */
export const IMAGE_W = 240;
export const NOTE_W = 200;
export const SWATCH = 96;
export const DRAWING_W = 320;
export const COMPONENT_W = 380;
export const GAP = 24;

/** Where things sit on a canvas made before it had positions: notes along the top, images in rows, colours to the right. */
function laidOut(data: MoodboardShellData): MoodboardItem[] {
  const items: MoodboardItem[] = [];
  data.keywords.forEach((keyword, i) => {
    items.push({ id: `note-${keyword}`, kind: "note", text: keyword, x: 40 + i * (NOTE_W - 40 + GAP), y: 0, w: NOTE_W - 40 });
  });
  data.images.forEach((image, i) => {
    items.push({ id: image.id, kind: "image", src: image.src, text: image.caption, x: 40 + (i % 4) * (IMAGE_W + GAP), y: 140 + Math.floor(i / 4) * 340, w: IMAGE_W });
  });
  const right = 40 + Math.min(4, Math.max(1, data.images.length)) * (IMAGE_W + GAP);
  data.palette.forEach((colour, i) => {
    items.push({ id: `colour-${colour}-${i}`, kind: "colour", colour, x: right + (i % 2) * (SWATCH + 16), y: 140 + Math.floor(i / 2) * (SWATCH + 36), w: SWATCH });
  });
  return items;
}

export const boardItems = (data: MoodboardShellData) => data.items ?? laidOut(data);

/**
 * The canvas's items, with the lists the smaller sizes and the model read kept
 * in step: images (drawings count, as pictures), the palette, short notes as keywords.
 */
export function withItems(data: MoodboardShellData, items: MoodboardItem[]): MoodboardShellData {
  return {
    ...data,
    items,
    images: items.flatMap((item) =>
      item.kind === "image" && item.src
        ? [{ id: item.id, src: item.src, caption: item.text }]
        : item.kind === "drawing" && item.code
          ? [{ id: item.id, src: svgUrl(item.code), caption: item.text }]
          : [],
    ),
    palette: items.filter((item) => item.kind === "colour" && item.colour).map((item) => item.colour!),
    keywords: items.filter((item) => item.kind === "note" && item.text?.trim() && item.text.length <= 40).map((item) => item.text!.trim()),
  };
}

/** An item's height when it hasn't been measured. */
export const heightOf = (item: MoodboardItem) =>
  item.h ??
  (item.kind === "image" ? item.w * 1.2 : item.kind === "colour" ? SWATCH + 24 : item.kind === "drawing" ? item.w * 0.75 : item.kind === "component" ? 280 : 120);

/** The box everything on the canvas fits in. */
export function boundsOf(items: MoodboardItem[]) {
  if (!items.length) return { x: 0, y: 0, w: 1, h: 1 };
  const x = Math.min(...items.map((item) => item.x));
  const y = Math.min(...items.map((item) => item.y));
  return {
    x,
    y,
    w: Math.max(...items.map((item) => item.x + item.w)) - x,
    h: Math.max(...items.map((item) => item.y + heightOf(item))) - y,
  };
}

/** Room to the right of everything on the canvas, for new things. */
export function freeSpot(items: MoodboardItem[]) {
  if (items.length === 0) return { x: 40, y: 40 };
  const right = Math.max(...items.map((item) => item.x + item.w));
  const top = Math.min(...items.map((item) => item.y));
  return { x: right + GAP * 2, y: Math.max(0, top) };
}

/** Everything lined up: images, drawings, components, notes, then colours. */
export function tidied(items: MoodboardItem[]): MoodboardItem[] {
  const order = { image: 0, drawing: 1, component: 2, note: 3, colour: 4 };
  let x = 40;
  let y = 40;
  let row = 0;
  return [...items]
    .sort((a, b) => order[a.kind] - order[b.kind])
    .map((item, i, all) => {
      if (i > 0 && (all[i - 1]!.kind !== item.kind || x > 1100)) {
        x = 40;
        y += row + GAP * 2;
        row = 0;
      }
      const placed = { ...item, x, y };
      x += item.w + GAP;
      row = Math.max(row, heightOf(item));
      return placed;
    });
}

export const canvasCounts = (items: MoodboardItem[]) => ({
  images: items.filter((item) => item.kind === "image").length,
  notes: items.filter((item) => item.kind === "note").length,
  colours: items.filter((item) => item.kind === "colour").length,
  drawings: items.filter((item) => item.kind === "drawing").length,
  components: items.filter((item) => item.kind === "component").length,
});

/**
 * Apply an edit made on the medium plus card (its keywords, palette or images)
 * to a canvas that has positions: new things land in free space, removed ones
 * leave the board, recoloured swatches keep their place.
 */
export function editCanvasLists(
  data: MoodboardShellData,
  next: Partial<Pick<MoodboardShellData, "keywords" | "palette" | "images">>,
): MoodboardShellData {
  if (!data.items) return { ...data, ...next };
  let items = data.items;
  const place = (item: Omit<MoodboardItem, "x" | "y">): MoodboardItem => ({ ...item, ...freeSpot(items) }) as MoodboardItem;
  if (next.keywords) {
    const gone = data.keywords.filter((keyword) => !next.keywords!.includes(keyword));
    items = items.filter((item) => !(item.kind === "note" && gone.includes(item.text?.trim() ?? "")));
    for (const keyword of next.keywords.filter((keyword) => !data.keywords.includes(keyword)))
      items = [...items, place({ id: `note-${keyword}-${items.length}`, kind: "note", text: keyword, w: NOTE_W })];
  }
  if (next.palette) {
    const colours = items.filter((item) => item.kind === "colour");
    const kept = new Set(colours.slice(0, next.palette.length).map((item) => item.id));
    items = items
      .filter((item) => item.kind !== "colour" || kept.has(item.id))
      .map((item) => (item.kind === "colour" ? { ...item, colour: next.palette![colours.indexOf(item)] } : item));
    for (const colour of next.palette.slice(colours.length)) items = [...items, place({ id: `colour-${colour}-${items.length}`, kind: "colour", colour, w: SWATCH })];
  }
  if (next.images) {
    const ids = new Set(next.images.map((image) => image.id));
    const had = new Set(data.images.map((image) => image.id));
    items = items.filter((item) => !(item.kind === "image" && had.has(item.id) && !ids.has(item.id)));
    for (const image of next.images.filter((image) => !had.has(image.id)))
      items = [...items, place({ id: image.id, kind: "image", src: image.src, text: image.caption, w: IMAGE_W })];
  }
  return withItems(data, items);
}
