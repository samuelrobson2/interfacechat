import type { ApiSchemas } from "@/shared/api/schema";
import { Text } from "@/shared/ui/kit/text";
import type { FinetuneHyperparamErrors } from "../lib/draft-to-validate-payload";
import type {
  FinetuneHyperparamDraft,
  FinetuneHyperparamDraftKey,
} from "../lib/finetune-hyperparam-cards";
import { FinetuneHyperparametersRecipeEditor } from "./finetune-hyperparameters-recipe-editor";

type FinetuneHyperparametersRecipeProps = {
  hyperparams: ApiSchemas["FinetuneSftHyperparamsDto"] | undefined;
  modelOptions: { id: string; displayName: string }[];
  draft: FinetuneHyperparamDraft;
  errors: FinetuneHyperparamErrors;
  isSyncing?: boolean;
  onDraftChange: (key: FinetuneHyperparamDraftKey, value: string) => void;
};

export function FinetuneHyperparametersRecipe({
  hyperparams,
  modelOptions,
  draft,
  errors,
  isSyncing = false,
  onDraftChange,
}: FinetuneHyperparametersRecipeProps) {
  if (!hyperparams || Object.keys(hyperparams).length === 0) {
    return (
      <div className="flex flex-col items-center text-center">
        <Text color="secondary" className="max-w-[640px]">
          No suggested hyperparameters for this training method (provider
          defaults will apply).
        </Text>
      </div>
    );
  }

  return (
    <FinetuneHyperparametersRecipeEditor
      hyperparams={hyperparams}
      modelOptions={modelOptions}
      draft={draft}
      errors={errors}
      isSyncing={isSyncing}
      onDraftChange={onDraftChange}
    />
  );
}
