import type { ApiSchemas } from "@/shared/api/schema";
import AlgorithmImage from "@/shared/assets/images/hyperparams/algorithm.png";
import AlphaImage from "@/shared/assets/images/hyperparams/alpha.png";
import EpochsImage from "@/shared/assets/images/hyperparams/epochs.png";
import GradientClippingImage from "@/shared/assets/images/hyperparams/gradient-clipping.png";
import OptimizerImage from "@/shared/assets/images/hyperparams/optimizer.png";
import RankImage from "@/shared/assets/images/hyperparams/rank-of-iora.png";
import TargetLayersImage from "@/shared/assets/images/hyperparams/target-layers.png";
import WarmupImage from "@/shared/assets/images/hyperparams/warmup-ratio.png";

export type FinetuneHyperparamDraftKey =
  | "algorithm"
  | "base_model"
  | "n_epochs"
  | "lora_r"
  | "lora_alpha"
  | "lora_trainable_modules"
  | "lr_scheduler_type"
  | "warmup_ratio"
  | "max_grad_norm"
  | "weight_decay";

export type FinetuneHyperparamDraft = Record<FinetuneHyperparamDraftKey, string>;

/**
 * Fields that only apply when the algorithm is `lora`. The recipe editor
 * disables their inputs in full-finetuning mode and the validate-payload
 * builder skips them so stale values don't surface confusing errors. Both
 * consumers must agree on the set, so it lives here next to the draft-key
 * type.
 */
export const LORA_ONLY_DRAFT_KEYS: ReadonlySet<FinetuneHyperparamDraftKey> =
  new Set(["lora_r", "lora_alpha", "lora_trainable_modules"]);

export type FinetuneHyperparamCardControl = "select" | "text";

export type FinetuneHyperparamCardDefinition = {
  id: string;
  title: string;
  imageSrc: string;
  /** Response field that must exist for this card to render. */
  sourceKey: keyof ApiSchemas["FinetuneSftHyperparamsDto"];
  draftKey: FinetuneHyperparamDraftKey;
  control: FinetuneHyperparamCardControl;
  useTicker?: boolean;
  selectOptions?: readonly { value: string; label: string }[];
  bold?: boolean;
};

/** Baseline copy for the Default column (not from API). */
export const FINETUNE_HYPERPARAM_DISPLAY_DEFAULTS: Record<string, string> = {
  algorithm: "LoRA",
  epochs: "1",
  "rank-of-lora": "4",
  alpha: "4",
  "target-layers": "q_proj, k_proj",
  optimizer: "Linear",
  "warmup-ratio": "0.0",
  "gradient-clipping": "0.5",
  "weight-decay": "0",
};

export const FINETUNE_HYPERPARAM_CARD_DEFINITIONS: readonly FinetuneHyperparamCardDefinition[] =
  [
    {
      id: "algorithm",
      title: "Algorithm",
      imageSrc: AlgorithmImage,
      sourceKey: "lora",
      draftKey: "algorithm",
      control: "select",
      selectOptions: [
        { value: "lora", label: "LoRA" },
        { value: "full", label: "Full finetuning" },
      ],
    },
    {
      id: "epochs",
      title: "Epochs",
      imageSrc: EpochsImage,
      sourceKey: "n_epochs",
      draftKey: "n_epochs",
      control: "text",
      bold: true,
    },
    {
      id: "rank-of-lora",
      title: "Rank of lora",
      imageSrc: RankImage,
      sourceKey: "lora_r",
      draftKey: "lora_r",
      control: "text",
      useTicker: true,
      bold: true,
    },
    {
      id: "alpha",
      title: "Alpha",
      imageSrc: AlphaImage,
      sourceKey: "lora_alpha",
      draftKey: "lora_alpha",
      control: "text",
      useTicker: true,
      bold: true,
    },
    {
      id: "target-layers",
      title: "Target Layers",
      imageSrc: TargetLayersImage,
      sourceKey: "lora_trainable_modules",
      draftKey: "lora_trainable_modules",
      control: "text",
    },
    {
      id: "optimizer",
      title: "Optimizer",
      imageSrc: OptimizerImage,
      sourceKey: "lr_scheduler_type",
      draftKey: "lr_scheduler_type",
      control: "select",
      selectOptions: [
        { value: "linear", label: "linear" },
        { value: "cosine", label: "cosine" },
      ],
    },
    {
      id: "warmup-ratio",
      title: "Warmup Ratio",
      imageSrc: WarmupImage,
      sourceKey: "warmup_ratio",
      draftKey: "warmup_ratio",
      control: "text",
      useTicker: true,
      bold: true,
    },
    {
      id: "gradient-clipping",
      title: "Gradient clipping",
      imageSrc: GradientClippingImage,
      sourceKey: "max_grad_norm",
      draftKey: "max_grad_norm",
      control: "text",
      useTicker: true,
      bold: true,
    },
    // {
    //   id: "weight-decay",
    //   title: "Weight Decay",
    //   imageSrc: WeightDecayImage,
    //   sourceKey: "weight_decay",
    //   draftKey: "weight_decay",
    //   control: "text",
    //   useTicker: true,
    // }
  ] as const;

export function shouldRenderFinetuneHyperparamCard(
  hp: ApiSchemas["FinetuneSftHyperparamsDto"],
  definition: FinetuneHyperparamCardDefinition,
): boolean {
  return Object.prototype.hasOwnProperty.call(hp, definition.sourceKey);
}

export function buildFinetuneHyperparamDraft(
  hp: ApiSchemas["FinetuneSftHyperparamsDto"],
): FinetuneHyperparamDraft {
  const draft = {
    algorithm: "",
    base_model: "",
    n_epochs: "",
    lora_r: "",
    lora_alpha: "",
    lora_trainable_modules: "",
    lr_scheduler_type: "",
    warmup_ratio: "",
    max_grad_norm: "",
    weight_decay: "",
  } satisfies FinetuneHyperparamDraft;

  if (Object.prototype.hasOwnProperty.call(hp, "lora")) {
    draft.algorithm = hp.lora === false ? "full" : "lora";
  }
  if (hp.n_epochs !== undefined && hp.n_epochs !== null) {
    draft.n_epochs = String(hp.n_epochs);
  }
  if (hp.lora_r !== undefined && hp.lora_r !== null) {
    draft.lora_r = String(hp.lora_r);
  }
  if (hp.lora_alpha !== undefined && hp.lora_alpha !== null) {
    draft.lora_alpha = String(hp.lora_alpha);
  }
  if (hp.lora_trainable_modules !== undefined && hp.lora_trainable_modules !== null) {
    draft.lora_trainable_modules = String(hp.lora_trainable_modules);
  }
  if (hp.lr_scheduler_type !== undefined && hp.lr_scheduler_type !== null) {
    draft.lr_scheduler_type = String(hp.lr_scheduler_type).toLowerCase();
  }
  if (hp.warmup_ratio !== undefined && hp.warmup_ratio !== null) {
    draft.warmup_ratio = String(hp.warmup_ratio);
  }
  if (hp.max_grad_norm !== undefined && hp.max_grad_norm !== null) {
    draft.max_grad_norm = String(hp.max_grad_norm);
  }
  if (hp.weight_decay !== undefined && hp.weight_decay !== null) {
    draft.weight_decay = String(hp.weight_decay);
  }

  return draft;
}
