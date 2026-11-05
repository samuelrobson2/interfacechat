import { ROUTES } from "@/shared/model/routes";

export const NEW_DATASET_KEYS = {
  preprocessing: "preprocessing",
  questionnaire: "questionnaire",
  mapping: "mapping",
  diagnosis: "diagnosis",
  recipes: "recipes",
  brand: "brand",
  expansion: "expansion",
  summary: "summary",
} as const;

export type NewDatasetKeys = keyof typeof NEW_DATASET_KEYS;

export const NEW_DATASET_ROUTES_MAP = {
  [NEW_DATASET_KEYS.preprocessing]: ROUTES.NEW_DATASET_PREPROCESSING,
  [NEW_DATASET_KEYS.questionnaire]: ROUTES.NEW_DATASET_QUESTIONNAIRE,
  [NEW_DATASET_KEYS.mapping]: ROUTES.NEW_DATASET_MAPPING,
  [NEW_DATASET_KEYS.diagnosis]: ROUTES.NEW_DATASET_DATA_DIAGNOSIS,
  [NEW_DATASET_KEYS.recipes]: ROUTES.NEW_DATASET_RECIPES,
  [NEW_DATASET_KEYS.brand]: ROUTES.NEW_DATASET_CONTROL_BRAND,
  [NEW_DATASET_KEYS.expansion]: ROUTES.NEW_DATASET_GROW,
  [NEW_DATASET_KEYS.summary]: ROUTES.NEW_DATASET_SUMMARY,
} as const;
