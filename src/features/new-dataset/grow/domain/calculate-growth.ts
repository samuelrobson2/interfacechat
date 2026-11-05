export function calculateGrowth(amountOfData: number, tags: Set<string>[]) {
  const percentage = amountOfData / 100;
  const totalTags = tags.reduce((acc, tag) => acc + tag.size, 0);

  return Number(1 + percentage * totalTags).toFixed(2);
}
