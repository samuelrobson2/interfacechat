/**
 * Generated tools and suggestions, for other features (the Design System page
 * shows interfaces with them). The rules engine stands in for the model.
 */
export { generateTools, TOOLBAR_KINDS, type ToolbarDataByKind, type ToolbarKind } from "./model/generate-tools";
export { placeOf, PER_PLACE } from "./model/tool-places";
export { suggestValues } from "./model/suggest-values";
export type { GeneratedTool } from "./model/tool-spec";
export { GenerativeToolbar } from "./ui/generative-toolbar";
