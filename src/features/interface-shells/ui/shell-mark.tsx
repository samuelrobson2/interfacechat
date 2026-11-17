import { createContext, useContext } from "react";
import type { ShellSize } from "../model/shell-types";

/**
 * Whether a shell draws its glyph beside its title: at every size, so an
 * interface always says what it is. A host whose own frame already shows the
 * glyph (a window bar) can turn it off.
 */
export const ShellMarkContext = createContext<boolean | undefined>(undefined);

export function useShellMark(size: ShellSize) {
  // Small is the glyph on its tile; every other size draws it by the title.
  return useContext(ShellMarkContext) ?? size !== "small";
}
