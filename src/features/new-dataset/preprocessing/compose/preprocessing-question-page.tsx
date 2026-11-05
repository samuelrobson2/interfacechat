import { href, useNavigate, useParams } from "react-router-dom";
import { ArrowLeftIcon } from "@/shared/assets/icons/outlined/ArrowLeft";
import { Button } from "@/shared/ui/kit/button";
import { Text } from "@/shared/ui/kit/text";
import { PREPROCESSING_QUESTION_IMAGES_MAP } from "../lib/question-images-map";
import { QuestionnaireItem } from "@/services/dataset";
import { useQuestions } from "@/services/dataset";
import { ROUTES } from "@/shared/model/routes";
import { checkDatasetStatus } from "../../_model/use-dataset-status-waiting";
import { usePreprocessingQuestionDataSuspense } from "../model/use-preprocessing-question-data-suspense";
import { usePreprocessingQuestionPost } from "../model/use-preprocessing-question-post";

export function PreprocessingQuestionPage() {
  const navigate = useNavigate();
  const { dataset_id } = useParams();
  const { questions, stepKey, statusData } =
    usePreprocessingQuestionDataSuspense();
  const { submitForm, isPending } = usePreprocessingQuestionPost();

  const {
    questionIndex,
    handleBack,
    handleQuestionClick,
    canGoBack,
    isAnswerSelected,
  } = useQuestions({
    questions,
    completeEarlyOnFirstFalse: true,
    onComplete: (answers) => {
      const firstKey = questions[0]?.key;
      if (firstKey && answers[firstKey]?.value === "false") {
        navigate(
          href(ROUTES.NEW_DATASET_PREPROCESS_FAILED, {
            dataset_id: dataset_id!,
          }),
        );
        return;
      }

      submitForm({
        [stepKey]: { ...answers },
      });
    },
  });

  const currentQuestion = questions[questionIndex];

  checkDatasetStatus(statusData);

  if (!currentQuestion) return null;

  return (
    <div className="flex flex-col h-full justify-between items-center">
      <div className="flex flex-col gap-15 items-center">
        {currentQuestion.description ? (
          <Text variant="h2" className="max-w-[650px] text-center">
            {currentQuestion.description}
          </Text>
        ) : null}
        <Text variant="h1" className="max-w-[650px] text-center h-24">
          {currentQuestion.title}
        </Text>

        <div className="flex gap-8">
          {currentQuestion.options?.map((option) => (
            <QuestionnaireItem
              disabled={isPending}
              key={option.id}
              as="button"
              title={option.title}
              description={
                "description" in option && option.description
                  ? option.description
                  : ""
              }
              image={
                PREPROCESSING_QUESTION_IMAGES_MAP[
                  option.key as keyof typeof PREPROCESSING_QUESTION_IMAGES_MAP
                ]
              }
              imageAlt={option.title}
              selected={isAnswerSelected(currentQuestion?.key, option.value)}
              onClick={() => handleQuestionClick(currentQuestion, option.value)}
              info={option.info}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-between w-full px-12 py-8">
        {canGoBack && (
          <Button
            variant="secondary"
            className="min-w-[172px]"
            onClick={handleBack}
            disabled={isPending}
          >
            <ArrowLeftIcon pathClasses="stroke-current" /> Back
          </Button>
        )}
      </div>
    </div>
  );
}
