import { QuestionnaireItem, useQuestions } from "@/services/dataset";
import { ArrowLeftIcon } from "@/shared/assets/icons/outlined/ArrowLeft";
import { Button } from "@/shared/ui/kit/button";
import { Text } from "@/shared/ui/kit/text";
import { DatasetFinetuneBackButton } from "../../_compose/dataset-finetune-back-button";
import { FINETUNE_STEP_KEYS } from "../../_lib/finetune-routes";
import { TRAINING_METHOD_IMAGES_MAP } from "../lib/training-method-images-map";
import { useTrainingMethodData } from "../model/use-training-method-data";
import { useTrainingMethodPost } from "../model/use-training-method-post";

const LOCKED_OPTIONS: Record<string, string> = {
  finetune_training_method_alignment: "Coming soon",
};

const BETA_OPTIONS = new Set(["finetune_training_method_instruction"]);

export function TrainingMethodPage() {
  const { questions, stepKey, title } = useTrainingMethodData();
  const { submitForm, isPending } = useTrainingMethodPost();

  const {
    questionIndex,
    handleBack,
    handleQuestionClick,
    canGoBack,
    isAnswerSelected,
  } = useQuestions({
    questions,
    onComplete: (answers) =>
      submitForm({
        [stepKey]: { ...answers },
      }),
  });

  const currentQuestion = questions[questionIndex];

  return (
    <div className="flex flex-col h-full justify-between items-center">
      <div className="flex flex-col gap-15 items-center">
        <Text variant="h1" className="max-w-[650px] text-center h-24">
          {currentQuestion?.title ?? title}
        </Text>

        <div className="flex gap-8">
          {currentQuestion?.options.map((option) => {
            const lockedText = LOCKED_OPTIONS[option.key];
            const isLocked = Boolean(lockedText);

            return (
              <QuestionnaireItem
                key={option.key}
                as="button"
                disabled={isPending}
                isLocked={isLocked}
                lockedText={lockedText}
                title={option.title ?? ""}
                description={option.description ?? ""}
                image={
                  TRAINING_METHOD_IMAGES_MAP[
                    option.key as keyof typeof TRAINING_METHOD_IMAGES_MAP
                  ]
                }
                imageAlt={option.title ?? option.key}
                selected={isAnswerSelected(currentQuestion.key, option.value)}
                withBetaBadge={BETA_OPTIONS.has(option.key)}
                onClick={() => {
                  if (isLocked) return;
                  handleQuestionClick(currentQuestion, option.value);
                }}
              />
            );
          })}
        </div>
      </div>

      <div className="flex justify-between w-full px-12 py-8">
        {canGoBack ? (
          <Button
            variant="secondary"
            className="min-w-[172px]"
            onClick={handleBack}
            disabled={isPending}
          >
            <ArrowLeftIcon pathClasses="stroke-current" /> Back
          </Button>
        ) : (
          <DatasetFinetuneBackButton
            stepKey={FINETUNE_STEP_KEYS.trainingMethod}
            className="min-w-[172px]"
          />
        )}
      </div>
    </div>
  );
}
