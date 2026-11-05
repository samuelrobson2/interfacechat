import type { ShellFill } from "./shell-fill";
import type { FillableKind } from "./shell-types";

const FILL_API = "/api/interface-fill";

/** Ask the model to fill a shell's parts for a suggestion. */
export async function requestShellFill<K extends FillableKind>(
  kind: K,
  options: { prompt?: string; project?: string } = {},
): Promise<ShellFill<K>> {
  const response = await fetch(FILL_API, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ kind, ...options }),
  });
  if (!response.ok) throw new Error(`Fill failed (${response.status})`);
  const { fill }: { fill: ShellFill<K> } = await response.json();
  return fill;
}
