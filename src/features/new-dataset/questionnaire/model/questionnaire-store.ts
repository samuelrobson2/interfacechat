import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface QuestionnaireState {
  train_model: string | undefined;
  training_dataset_type: string | undefined;
  brand_guidelines: string | undefined;
  expand_dataset: string | undefined;
}

interface QuestionnaireActions {
  setTrainModel: (value: string | undefined) => void;
  setTrainingDatasetType: (value: string | undefined) => void;
  setBrandGuidelines: (value: string | undefined) => void;
  setExpandDataset: (value: string | undefined) => void;
}

type QuestionnaireStore = QuestionnaireState & QuestionnaireActions;

export const useQuestionnaireStore = create<QuestionnaireStore>()(
  immer((set) => ({
    // State
    train_model: undefined,
    training_dataset_type: undefined,
    brand_guidelines: undefined,
    expand_dataset: undefined,

    // Actions
    setTrainModel: (value: string | undefined) =>
      set((state) => {
        state.train_model = value;
      }),

    setTrainingDatasetType: (value: string | undefined) =>
      set((state) => {
        state.training_dataset_type = value;
      }),

    setBrandGuidelines: (value: string | undefined) =>
      set((state) => {
        state.brand_guidelines = value;
      }),

    setExpandDataset: (value: string | undefined) =>
      set((state) => {
        state.expand_dataset = value;
      }),
  })),
);

