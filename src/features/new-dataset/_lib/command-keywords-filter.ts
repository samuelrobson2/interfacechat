export type CommandKeywordsFilter = (
  value: string,
  search: string,
  keywords?: string[],
) => number;

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export const commandKeywordsStartsWithFilter: CommandKeywordsFilter = (
  _value,
  search,
  keywords = [],
) => {
  const query = normalize(search);
  if (!query) return 1;

  return keywords.some((keyword) => normalize(keyword).startsWith(query)) ? 1 : 0;
};
