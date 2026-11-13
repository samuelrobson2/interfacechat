export { InterfaceShell, type InterfaceShellProps } from "./interface-shell";
export { InlineShell } from "./inline/inline-shell";
export { InlineMedium } from "./inline/inline-medium";
export { InlineSmall } from "./inline/inline-small";
export { hasInline, inlineDetail, inlineTitle } from "./inline/inline-summary";
export { DocumentShell } from "./document/document-shell";
export { SearchShell } from "./search/search-shell";
export { TableShell } from "./table/table-shell";
export { ShellAppIcon, ShellGlyph } from "./ui/shell-icons";
export {
  parseMarkdownTable,
  serializeMarkdownTable,
} from "./model/markdown-table";
export {
  parseSearchResults,
  serializeSearchResults,
} from "./model/search-results";
export { EMPTY_SHELL_DATA, SHELL_FIXTURES } from "./model/shell-fixtures";
export {
  fillToShellData,
  shellFillOf,
  type ShellFill,
  type ShellFillDetails,
} from "./model/shell-fill";
export { requestShellFill } from "./model/shell-fill-api";
export { SHELL_META } from "./model/shell-meta";
export {
  CATALOGUE,
  CATALOGUE_KINDS,
  FILL_TOOL_KIND,
  applyCatalogueOperations,
  catalogueFields,
  isCatalogueKind,
  readCatalogueValue,
  type CatalogueKind,
  type CatalogueOperation,
  type CatalogueValue,
  type CatalogueValueByKind,
} from "./model/shell-catalogue";
export { CHART_TYPE_META, chartTypeFor } from "./model/chart";
export * from "./model/shell-types";
export { generatorModeFor } from "./model/generator";
export {
  SHELL_PARTS,
  setShellParts,
  shellParts,
  shellPartsSummary,
  type ShellPart,
  type ShellPartType,
} from "./model/shell-parts";
export {
  SHELL_RETRIEVAL,
  SHELL_ROUTE_FLOOR,
  copyShellRetrieval,
  routeShellDraft,
  scoreProfile,
  setShellRetrieval,
  shellAvoidScore,
  shellKindScore,
  shellScoreBreakdown,
  shellQueryMatchScore,
  shellRetrieval,
  shellTriggerScore,
  type ShellRetrieval,
} from "./model/shell-retrieval";
export {
  CHAT_FORMAT_KINDS,
  chatFormatFor,
  chatFormatRetrieval,
  setChatFormatRetrieval,
  CHAT_PERSONA_KINDS,
  chatPersonaFor,
  chatPersonaRetrieval,
  setChatPersonaRetrieval,
  type ChatFormatKind,
  type ChatPersonaKind,
} from "./model/shell-retrieval";
export {
  ASSISTANT_SUGGESTIONS,
  assistantInstruction,
  CHAT_FORMAT_META,
  CHAT_PERSONA_META,
  FORMAT_SUGGESTIONS,
  formatInstruction,
} from "./model/chat-formats";
// Dashboard and Article: apps built from data, variables and blocks, with runnable code.
export { ArticleShell, DashboardShell, type AppShellProps } from "./apps/app-shells";
export { LinkableDataContext, type LinkableData } from "./apps/app-data-menu";
export { articleFixture, dashboardFixture, emptyArticle, emptyDashboard } from "./apps/app-fixtures";
export { ALL as APP_ALL, columnsOf, runQuery } from "./apps/app-query";
export * from "./apps/app-types";
export { appToCatalogue, catalogueToApp } from "./apps/app-catalogue";
export { appDetail, blockLabel } from "./apps/app-detail";
