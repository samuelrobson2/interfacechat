/** Stable colours for categories, groups and task types. */
export const ACCENTS = [
  { fill: "bg-blue-4/25", solid: "bg-blue-4", text: "text-blue-5", mark: "bg-blue-4/20", bar: "bg-blue-4/60" },
  { fill: "bg-orange-5/25", solid: "bg-orange-5", text: "text-orange-5", mark: "bg-orange-5/20", bar: "bg-orange-5/60" },
  { fill: "bg-green-5/30", solid: "bg-green-5", text: "text-green-5", mark: "bg-green-5/25", bar: "bg-green-5/60" },
  { fill: "bg-mint-2/35", solid: "bg-mint-2", text: "text-mint-3", mark: "bg-mint-2/30", bar: "bg-mint-2/70" },
  { fill: "bg-red-5/20", solid: "bg-red-5", text: "text-red-5", mark: "bg-red-5/15", bar: "bg-red-5/50" },
];

export const accentOf = (index: number) => ACCENTS[((index % ACCENTS.length) + ACCENTS.length) % ACCENTS.length]!;

/** Empty states name what goes there: "Item 1", "Item 2", "Item 3". */
export function ghostLabels(noun: string, count = 3) {
  return Array.from({ length: count }, (_, i) => `${noun} ${i + 1}`);
}
