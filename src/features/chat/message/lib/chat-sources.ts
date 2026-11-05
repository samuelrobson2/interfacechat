export type ChatSource = {
  id: string;
  title: string;
  url: string;
  source: string;
  description?: string;
  image_url?: string;
};

export type ChatSourcesData = {
  sources: ChatSource[];
  // Maps an inline footnote id (e.g. "1" from markdown `[^1]`) to the source
  // ids that should appear when the user clicks that inline reference.
  groups: Record<string, string[]>;
};

export const EMPTY_SOURCES_DATA: ChatSourcesData = {
  sources: [],
  groups: {},
};

export const toExternalHref = (url: string) =>
  /^https?:\/\//i.test(url) ? url : `https://${url}`;

export const getSourcesForGroup = (
  data: ChatSourcesData,
  groupKey: string,
): ChatSource[] => {
  if (groupKey === "all") return data.sources;
  const ids = data.groups[groupKey];
  if (!ids?.length) return [];
  const byId = new Map(data.sources.map((s) => [s.id, s]));
  return ids
    .map((id) => byId.get(id))
    .filter((s): s is ChatSource => Boolean(s));
};

