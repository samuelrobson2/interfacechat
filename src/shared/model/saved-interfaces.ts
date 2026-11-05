// Locally-saved interfaces surfaced on the chat dashboard's "Interfaces" tab.
// Written by feature flows (e.g. a created Slack app) and read by the dashboard,
// so the concrete storage lives in `shared` for both layers to reach.

export type SavedInterface = {
  /** Stable id (e.g. the Slack app id). */
  id: string;
  /** Display name shown on the card. */
  title: string;
  /** Chat category for the card's colour/icon. */
  category: string;
  /** Route to reopen the interface. */
  to: string;
  savedAt: string;
};

const KEY = "adaption.saved-interfaces:v1";

function read(): SavedInterface[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as SavedInterface[]) : [];
  } catch {
    return [];
  }
}

function write(list: SavedInterface[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // best-effort
  }
}

/** Most-recent-first list of saved interfaces. */
export function loadSavedInterfaces(): SavedInterface[] {
  return read();
}

/** Insert or update by id (keeps the original savedAt), most-recent first. */
export function upsertSavedInterface(
  entry: Omit<SavedInterface, "savedAt"> & { savedAt?: string },
): void {
  const list = read();
  const existing = list.find((x) => x.id === entry.id);
  const savedAt = existing?.savedAt ?? entry.savedAt ?? new Date().toISOString();
  write([{ ...entry, savedAt }, ...list.filter((x) => x.id !== entry.id)]);
}
