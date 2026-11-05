import { useSubscriptionData } from "@/services/payment";
import { PlansListDialog } from "@/services/plans";
import { ArrowLeftIcon } from "@/shared/assets/icons/outlined/ArrowLeft";
import { Button } from "@/shared/ui/kit/button";
import { Text } from "@/shared/ui/kit/text";
import { useState } from "react";
import { checkDatasetStatus } from "../../_model/use-dataset-status-waiting";
import { QUESTIONNAIRE_IMAGES_MAP } from "../lib/questionnaire-images-map";
import { useQuestionnaireDataSuspense } from "../model/use-questionnaire-data-suspense";
import { useQuestionnairePost } from "../model/use-questionnaire-post";
import { QuestionnaireItem } from "@/services/dataset";
import { useQuestions } from "@/services/dataset";
import { ArrowRightIcon } from "@/shared/assets/icons/outlined/ArrowRight";

export function QuestionnairePage() {
  const [plansOpen, setPlansOpen] = useState(false);
  const { questions, stepKey, statusData, subscriptions, activeGrantedPlan } =
    useQuestionnaireDataSuspense();
  const { checkAccess } = useSubscriptionData(subscriptions, activeGrantedPlan);

  const { submitForm, isPending } = useQuestionnairePost();
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
  const canSkip = currentQuestion?.key === "expansion_type";

  checkDatasetStatus(statusData);

  return (
    <>
      <div className="flex flex-col h-full justify-between items-center">
        <div className="flex flex-col gap-15 items-center">
          <Text variant="h1" className="max-w-[650px] text-center h-24">
            {currentQuestion?.title}
          </Text>

          <div className="flex gap-8">
            {currentQuestion?.options?.map((question) => {
              const requiredPlans = question?.required_plans;
              const hasRequiredPlans = !!requiredPlans?.length;
              const hasAccess = checkAccess(requiredPlans);
              const isLocked = hasRequiredPlans && !hasAccess;

              return (
                <QuestionnaireItem
                  disabled={isPending}
                  isLocked={isLocked}
                  lockedText="Plus only"
                  key={question.id}
                  as="button"
                  title={question.title}
                  description={question.description || ""}
                  image={
                    QUESTIONNAIRE_IMAGES_MAP[
                      question.key as keyof typeof QUESTIONNAIRE_IMAGES_MAP
                    ]
                  }
                  imageAlt={question.title}
                  selected={isAnswerSelected(
                    currentQuestion?.key,
                    question.value,
                  )}
                  onUnlock={() => setPlansOpen(true)}
                  onClick={() => {
                    if (isLocked) return;
                    handleQuestionClick(currentQuestion, question.value);
                  }}
                />
              );
            })}
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
          {canSkip && (
            <Button
              className="min-w-[172px] ml-auto"
              onClick={() => handleQuestionClick(currentQuestion, "")}
              disabled={isPending}
            >
              Skip
              <ArrowRightIcon pathClasses="stroke-current" />
            </Button>
          )}
        </div>
      </div>

      <PlansListDialog open={plansOpen} onOpenChange={setPlansOpen} />
    </>
  );
}
