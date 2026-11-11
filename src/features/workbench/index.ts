export { ReplyPeek, WorkbenchSurface, type WorkbenchSurfaceProps } from "./ui/workbench-surface";
export { WorkbenchHostContext, useWorkbenchHost, type WorkbenchHost, type WorkbenchInstance } from "./model/workbench-host";
export { fitsWidth, type Rect } from "./model/workbench-geometry";
export {
  addEntry,
  applyLayoutChange,
  isVisible,
  previewLayoutChange,
  restoreArrangement,
  touchEntry,
  type InstanceId,
  type LayoutChange,
  type LayoutEntry,
  type LayoutResult,
  type WorkspaceLayout,
} from "./model/workbench-layout";
export { COMPOSER_WIDTH, ordinalsOf, shellSizeFor } from "./model/workbench-view";
