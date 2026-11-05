import { ROUTES } from "@/shared/model/routes";

export const FINETUNE_STEP_KEYS = {
  trainingMethod: "finetune_training_method",
  columns: "finetune_columns",
  augmentation: "finetune_augmentation",
  credits: "finetune_credits",
  model: "finetune_model",
  recipe: "finetune_recipe",
  confirm: "finetune_confirm",
} as const;

export type FinetuneStepKey =
  (typeof FINETUNE_STEP_KEYS)[keyof typeof FINETUNE_STEP_KEYS];

export const FINETUNE_ROUTES_BY_STEP_KEY: Partial<
  Record<FinetuneStepKey, string>
> = {
  [FINETUNE_STEP_KEYS.trainingMethod]: ROUTES.DATASET_FINETUNE_TRAINING_METHOD,
  [FINETUNE_STEP_KEYS.columns]: ROUTES.DATASET_FINETUNE_COLUMNS,
  [FINETUNE_STEP_KEYS.augmentation]: ROUTES.DATASET_FINETUNE_AUGMENTATION,
  [FINETUNE_STEP_KEYS.credits]: ROUTES.DATASET_FINETUNE_CREDITS,
  [FINETUNE_STEP_KEYS.recipe]: ROUTES.DATASET_FINETUNE_HYPERPARAMETERS,
  [FINETUNE_STEP_KEYS.confirm]: ROUTES.DATASET_FINETUNE_CONFIRM,
};
