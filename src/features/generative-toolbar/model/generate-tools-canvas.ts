import type { MoodboardShellData } from "@/features/interface-shells";
import { clip, mix, plural } from "./tool-helpers";
import type { GeneratedTool } from "./tool-spec";

/*
 * Canvas's generated tools. Ones about what's on the board (fill it out, make
 * more around a note) float on the board; ones that steer the whole look sit
 * in the toolbar.
 */

type Tool = GeneratedTool<MoodboardShellData>;

const toHex = (n: number) => Math.round(Math.min(255, Math.max(0, n))).toString(16).padStart(2, "0");

/** A colour nudged warmer (positive) or cooler (negative). */
function warm(hex: string, amount: number) {
  const value = hex.replace("#", "");
  if (!/^[0-9a-f]{6}$/i.test(value)) return hex;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(value.slice(i, i + 2), 16)) as [number, number, number];
  return `#${toHex(r + amount)}${toHex(g + amount * 0.25)}${toHex(b - amount)}`;
}

/** How warm the palette reads now, as a step from Cool (0) to Warm (4). */
function warmthOf(palette: string[]) {
  if (!palette.length) return 2;
  const lean =
    palette.reduce((sum, hex) => {
      const value = hex.replace("#", "");
      return sum + (parseInt(value.slice(0, 2), 16) - parseInt(value.slice(4, 6), 16));
    }, 0) / palette.length;
  return Math.max(0, Math.min(4, Math.round(2 + lean / 30)));
}

export function canvasTools(data: MoodboardShellData): Tool[] {
  const items = data.items;
  const images = items ? items.filter((item) => item.kind === "image").length : data.images.length;
  const notes = items ? items.filter((item) => item.kind === "note" && item.text) : data.keywords.map((text) => ({ text }));
  const palette = data.palette;
  const look = data.title.trim() || "this look";

  if (images === 0 && notes.length === 0 && palette.length === 0) {
    return [
      { type: "action", id: "start", label: "Start the canvas", detail: `Images, notes and colours for ${clip(look, 40)}`, icon: "sparkles", place: "board" },
      {
        type: "choice",
        id: "begin",
        label: "Begin with",
        detail: "What to put down first",
        icon: "grid",
        options: [
          { id: "images", label: "Images" },
          { id: "words", label: "Words" },
          { id: "colours", label: "Colours" },
        ],
        value: "images",
      },
    ];
  }

  const steps = ["Cool", "Cooler", "Neutral", "Warmer", "Warm"];
  const now = warmthOf(palette);
  const firstNote = notes[0]?.text;

  const controls: Tool[] = [
    {
      type: "grid",
      id: "mood",
      label: "Mood",
      detail: "Steer the canvas; new images follow",
      icon: "grid",
      x: { low: "Quiet", high: "Bold" },
      y: { low: "Raw", high: "Polished" },
      quadrants: ["Refined", "Statement", "Intimate", "Gritty"],
      value: { x: 0.35, y: 0.4 },
    },
    ...(palette.length
      ? [
          {
            type: "slider" as const,
            id: "warmth",
            label: "Warmth",
            detail: `The palette reads ${steps[now]!.toLowerCase()}`,
            icon: "sliders" as const,
            min: { label: "Cool" },
            max: { label: "Warm" },
            steps,
            value: now,
            // Shifts the colours on the canvas, and the palette with them.
            apply: (d: MoodboardShellData, value: number) => {
              const amount = (value - now) * 18;
              return {
                ...d,
                palette: d.palette.map((hex) => warm(hex, amount)),
                items: d.items?.map((item) => (item.kind === "colour" && item.colour ? { ...item, colour: warm(item.colour, amount) } : item)),
              };
            },
          },
        ]
      : []),
    {
      type: "choice",
      id: "next",
      label: "Next images",
      detail: "What kind of pictures to generate next",
      icon: "image",
      options: [
        { id: "scenes", label: "Scenes" },
        { id: "textures", label: "Textures" },
        { id: "people", label: "People" },
        { id: "objects", label: "Objects" },
      ],
      value: "scenes",
    },
  ];

  const actions: Tool[] = [
    {
      type: "action",
      id: "fill",
      label: "Fill out the look",
      detail: `Three more images around ${plural(images, "image")} here`,
      icon: "image",
      place: "board",
    },
    ...(firstNote
      ? [
          {
            type: "action" as const,
            id: "from-note",
            label: `Picture ${clip(firstNote, 16)}`,
            detail: `Images for the note “${clip(firstNote, 40)}”`,
            icon: "sparkles" as const,
            place: "board" as const,
          },
        ]
      : []),
    {
      type: "action",
      id: "palette",
      label: "Palette from images",
      detail: `Pull colours out of ${plural(images, "image")}`,
      icon: "image",
      place: "board",
    },
    { type: "action", id: "name", label: "Name the look", detail: "Three names for what the canvas shares", icon: "text" },
    { type: "action", id: "brief", label: "Write a brief", detail: "A paragraph a designer could work from", icon: "text" },
    { type: "action", id: "cluster", label: "Group by theme", detail: "Arrange the canvas into clusters", icon: "grid" },
    { type: "toggle", id: "keep-palette", label: "Keep the palette", detail: "New images must fit the colours already here", icon: "check", value: false },
  ];
  return mix(controls, actions);
}
