// Parses an aspect ratio string like "16:9" or "4/3" into a CSS aspect-ratio
// value ("16 / 9"). Returns undefined when the input is missing or invalid.
export const parseAspectRatio = (
  raw: string | undefined,
): string | undefined => {
  if (!raw) return undefined;
  const match = raw.match(/^\s*(\d+(?:\.\d+)?)\s*[:/]\s*(\d+(?:\.\d+)?)\s*$/);
  if (!match) return undefined;
  const width = Number(match[1]);
  const height = Number(match[2]);
  if (!width || !height) return undefined;
  return `${width} / ${height}`;
};
