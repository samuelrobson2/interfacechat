import { createContext, useContext } from "react";
import type { ShellSize } from "../model/shell-types";

/**
 * Whether a shell draws its glyph beside its title. A large interface sits in
 * a window whose bar carries the glyph, so by default it leaves its own out;
 * a host that frames a smaller size the same way can turn it off there too.
 */
export const ShellMarkContext = createContext<boolean | undefined>(undefined);

export function useShellMark(size: ShellSize) {
  return useContext(ShellMarkContext) ?? size !== "large";
}
