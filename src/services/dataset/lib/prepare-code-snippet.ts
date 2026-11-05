import type { ApiSchemas } from "@/shared/api/schema";
import { CONFIG } from "@/shared/model/config";

export type DatasetSnippetParam = ApiSchemas["SnippetParamDto"];
export type DatasetSnippetCase = ApiSchemas["SnippetCaseDto"];
export type DatasetSnippetStrings = ApiSchemas["SnippetStringsDto"];

export function snippetKeys(
  snippets: DatasetSnippetStrings,
): string[] {
  const record = snippets as Record<string, string>;
  return Object.keys(record).filter((k) => String(record[k] ?? "").trim());
}

export function snippetLanguageLabel(key: string): string {
  const lower = key.toLowerCase();
  if (lower === "curl") return "cURL";
  if (!key.length) return key;
  return key.charAt(0).toUpperCase() + key.slice(1).toLowerCase();
}

export function snippetKeyToShikiLang(key: string): string {
  const lower = key.toLowerCase();
  if (lower === "curl") return "bash";
  return lower;
}

const DOCS_API_V1_PREFIX = "https://api.adaption.ai/api/v1";

function hydratePlaceholders(
  snippet: string,
  params: DatasetSnippetParam[],
  context: Record<string, string>,
): string {
  let result = snippet;
  for (const param of params) {
    result = result.replaceAll(
      `{{${param.key}}}`,
      context[param.key] ?? param.placeholder,
    );
  }
  return result;
}

function replaceDocsApiHost(snippet: string): string {
  const base = String(CONFIG.API_BASE_URL ?? "").replace(/\/+$/, "");
  if (!base) return snippet;
  return snippet.replaceAll(DOCS_API_V1_PREFIX, base);
}

/** Hydrates `{{KEY}}` tokens and points doc URLs at `CONFIG.API_BASE_URL`. */
export function prepareDatasetCodeSnippet(
  snippet: string,
  params: DatasetSnippetParam[],
  context: Record<string, string>,
): string {
  return replaceDocsApiHost(hydratePlaceholders(snippet, params, context));
}

/** One row per non-empty snippet string from the API (for UI tabs + CodeBlock). */
export type DatasetSnippetItem = {
  key: string;
  language: string;
  code: string;
  shikiLang: string;
};

export function buildDatasetSnippetItems(
  payload: DatasetSnippetCase,
  datasetId: string,
): DatasetSnippetItem[] {
  const ctx = { DATASET_ID: datasetId };
  return snippetKeys(payload.snippets).map((key) => {
    const raw = payload.snippets[key as keyof DatasetSnippetStrings];
    return {
      key,
      language: snippetLanguageLabel(key),
      code: prepareDatasetCodeSnippet(String(raw), payload.params, ctx),
      shikiLang: snippetKeyToShikiLang(key),
    };
  });
}
