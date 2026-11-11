import { createContext, useContext } from "react";
import type { ShellKind } from "@/features/interface-shells";
import type { InstanceId } from "./workbench-layout";
import type { NavStack, NavView } from "./workbench-navigation";

/** One interface on the workbench: a stable id and the kind of interface it is. */
export type WorkbenchInstance = { id: InstanceId; kind: ShellKind };

/**
 * What a frame needs from whoever owns the workbench's state: the sandbox's
 * fixture store, or a chat thread. Layout arrives as props; this is the rest.
 */
export type WorkbenchHost = {
  /** The person did something inside this interface. */
  touch: (id: InstanceId) => void;
  /** The interface's name, as in "Document". */
  labelOf: (id: InstanceId) => string;
  /** What it's showing, as in "Shot list". */
  titleOf: (id: InstanceId) => string;
  /** Back, forward and history. A host without them shows a plain icon. */
  navigation?: {
    stackOf: (id: InstanceId) => NavStack | undefined;
    titleOf: (artifactId: string, fallback: string) => string;
    /** Other artifacts of this kind that could be opened here. */
    siblings: (kind: ShellKind) => { id: string; title: string }[];
    navigate: (id: InstanceId, artifactId: string, view?: NavView) => void;
    back: (id: InstanceId, view?: NavView) => void;
    forward: (id: InstanceId, view?: NavView) => void;
    goTo: (id: InstanceId, index: number, view?: NavView) => void;
    createArtifact: (kind: ShellKind) => string;
  };
};

export const WorkbenchHostContext = createContext<WorkbenchHost | null>(null);

export function useWorkbenchHost(): WorkbenchHost {
  const host = useContext(WorkbenchHostContext);
  if (!host) throw new Error("A workbench frame needs a WorkbenchHost");
  return host;
}
