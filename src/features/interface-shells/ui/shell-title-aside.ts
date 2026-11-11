import { createContext, createElement, useContext, type ReactNode } from "react";

/**
 * Something a host puts at the end of a shell's title row, such as Chart's
 * type picker, without the shell drawing it itself.
 */
const ShellTitleAsideContext = createContext<ReactNode>(null);

export function ShellTitleAside({ value, children }: { value: ReactNode; children: ReactNode }) {
  return createElement(ShellTitleAsideContext.Provider, { value }, children);
}

export function useShellTitleAside() {
  return useContext(ShellTitleAsideContext);
}
