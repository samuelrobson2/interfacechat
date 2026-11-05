/**
 * Maximum length matches the backend column constraint on `Dataset.name`.
 */
export const COMBINE_NAME_MAX_LENGTH = 255;

const SEPARATOR = " & ";
const ELLIPSIS = "…";

/**
 * Builds the prefilled name shown in the combine name dialog. Joins source
 * names with " & " and truncates to `COMBINE_NAME_MAX_LENGTH` characters.
 * Empty/whitespace-only names are filtered out; an empty input yields "".
 */
export function buildCombineName(
  sourceNames: ReadonlyArray<string | null | undefined>,
  maxLength: number = COMBINE_NAME_MAX_LENGTH,
): string {
  const sanitized = sourceNames
    .map((n) => (typeof n === "string" ? n.trim() : ""))
    .filter((n) => n.length > 0);

  if (sanitized.length === 0) return "";

  const joined = sanitized.join(SEPARATOR);
  if (joined.length <= maxLength) return joined;

  if (maxLength <= ELLIPSIS.length) return ELLIPSIS.slice(0, maxLength);
  return `${joined.slice(0, maxLength - ELLIPSIS.length)}${ELLIPSIS}`;
}
