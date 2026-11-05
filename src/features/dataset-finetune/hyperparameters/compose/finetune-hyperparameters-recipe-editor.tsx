import type { ApiSchemas } from "@/shared/api/schema";
import ModelNameImage from "@/shared/assets/images/hyperparams/model-name.png";
import { cn } from "@/shared/lib/css";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/kit/select";
import type { FinetuneHyperparamErrors } from "../lib/draft-to-validate-payload";
import {
  FINETUNE_HYPERPARAM_CARD_DEFINITIONS,
  LORA_ONLY_DRAFT_KEYS,
  shouldRenderFinetuneHyperparamCard,
  type FinetuneHyperparamCardDefinition,
  type FinetuneHyperparamDraft,
  type FinetuneHyperparamDraftKey,
} from "../lib/finetune-hyperparam-cards";
import { FinetuneHyperparamCard } from "./finetune-hyperparam-card";
import { FinetuneHyperparametersAdaptedTextInput } from "./finetune-hyperparameters-adapted-text-input";
import { CONFIG } from "@/shared/model/config";

type FinetuneHyperparametersRecipeEditorProps = {
  hyperparams: ApiSchemas["FinetuneSftHyperparamsDto"];
  modelOptions: { id: string; displayName: string }[];
  draft: FinetuneHyperparamDraft;
  errors: FinetuneHyperparamErrors;
  isSyncing?: boolean;
  onDraftChange: (key: FinetuneHyperparamDraftKey, value: string) => void;
};

function RecipeSelect({
  value,
  options,
  disabled,
  onChange,
  className,
}: {
  value: string;
  options: readonly { value: string; label: string }[];
  disabled?: boolean;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <Select value={value} disabled={disabled} onValueChange={onChange}>
      <SelectTrigger
        size="pill"
        variant="rounded"
        className={cn(
          "h-[52px] min-h-[52px] text-center tabular-nums font-mono leading-[1] [&>span]:w-full [&>span]:text-center",
          className,
        )}
      >
        <SelectValue placeholder="-" />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function renderAdaptedControl(
  definition: FinetuneHyperparamCardDefinition,
  draft: FinetuneHyperparamDraft,
  setField: (key: FinetuneHyperparamDraftKey, value: string) => void,
  disabled: boolean,
  hasError: boolean,
  bold = false,
) {
  const value = draft[definition.draftKey] ?? "";

  if (definition.control === "select" && definition.selectOptions?.length) {
    return (
      <RecipeSelect
        value={value}
        options={definition.selectOptions}
        disabled={disabled}
        onChange={(v) => setField(definition.draftKey, v)}
        className={bold ? "font-bold" : undefined}
      />
    );
  }

  return (
    <FinetuneHyperparametersAdaptedTextInput
      value={value}
      onChange={(v) => setField(definition.draftKey, v)}
      aria-label={definition.title}
      disabled={disabled}
      isError={hasError}
      useTicker={definition.useTicker}
      bold={bold}
    />
  );
}

export function FinetuneHyperparametersRecipeEditor({
  hyperparams,
  modelOptions,
  draft,
  errors,
  isSyncing = false,
  onDraftChange,
}: FinetuneHyperparametersRecipeEditorProps) {
  const isFullFinetuning = draft.algorithm === "full";
  const controlsDisabled = isSyncing;
  const visibleCards = FINETUNE_HYPERPARAM_CARD_DEFINITIONS.filter((def) =>
    shouldRenderFinetuneHyperparamCard(hyperparams, def),
  );
  const modelCardInsertIndex = Math.min(3, visibleCards.length);

  const renderCard = (definition: FinetuneHyperparamCardDefinition) => {
    const errorMessage = errors[definition.draftKey]?.[0];
    return (
      <FinetuneHyperparamCard
        key={definition.id}
        title={definition.title}
        imageSrc={definition.imageSrc}
        errorMessage={errorMessage}
        adaptedSlot={renderAdaptedControl(
          definition,
          draft,
          onDraftChange,
          controlsDisabled ||
            (isFullFinetuning && LORA_ONLY_DRAFT_KEYS.has(definition.draftKey)),
          Boolean(errorMessage),
          Boolean(definition.bold),
        )}
      />
    );
  };

  return (
    <div className="grid w-full max-w-[1200px] grid-cols-1 gap-6 justify-items-center sm:grid-cols-2 lg:grid-cols-3">
      {visibleCards.slice(0, modelCardInsertIndex).map(renderCard)}
      <FinetuneHyperparamCard
        key="model-name"
        title="Model Name"
        imageSrc={ModelNameImage}
        adaptedSlot={
          <>
            {CONFIG.APP_ENV === "dev" ? (
              <RecipeSelect
                value={draft.base_model}
                options={modelOptions.map((m) => ({
                  value: m.id,
                  label: m.displayName,
                }))}
                disabled={controlsDisabled || modelOptions.length === 0}
                onChange={(value) => onDraftChange("base_model", value)}
                className="[&>span]:overflow-hidden [&>span]:text-ellipsis [&>span]:whitespace-nowrap"
              />
            ) : (
              <FinetuneHyperparametersAdaptedTextInput
                value={draft.base_model}
                onChange={() => undefined}
                aria-label="Model Name"
                disabled
                className="[&>span]:overflow-hidden [&>span]:text-ellipsis [&>span]:whitespace-nowrap"
              />
            )}
          </>
        }
      />
      {visibleCards.slice(modelCardInsertIndex).map(renderCard)}
    </div>
  );
}
