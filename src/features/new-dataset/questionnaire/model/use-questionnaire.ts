import type { ApiSchemas } from "@/shared/api/schema";
import { useRef, useState } from "react";

const NO = "false";

export function useQuestionnaire({
  onComplete,
  questions,
}: {
  onComplete: (answers: Record<string, { value: string }>) => void;
  questions: ApiSchemas["Field"][];
}) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const answersRef = useRef<Record<string, { value: string }>>({});
  const n = questions.length;

  const getFieldAnswer = (field?: ApiSchemas["Field"]) =>
    field
      ? answersRef.current[field.key]?.value || field.response_values?.[0]?.value
      : undefined;

  const handleQuestionClick = (field: ApiSchemas["Field"], value: string) => {
    answersRef.current[field.key] = { value };
    const relatedIndex = field.relation
      ? questions.findIndex((q) => q.key === field.relation)
      : -1;
    const next =
      value === NO && relatedIndex === questionIndex + 1
        ? relatedIndex + 1
        : questionIndex + 1;

    if (next < n) {
      setQuestionIndex(next);
      return;
    }
    onComplete(answersRef.current);
  };

  const handleBack = () => {
    setQuestionIndex((i) => {
      if (i <= 0) return i;

      const prev = questions[i - 1];
      if (!prev) return i - 1;

      const controllerIndex = (() => {
        for (let idx = i - 2; idx >= 0; idx -= 1) {
          if (questions[idx]?.relation === prev.key) return idx;
        }
        return -1;
      })();

      const skippedMiddle =
        controllerIndex >= 0 &&
        controllerIndex + 1 === i - 1 &&
        getFieldAnswer(questions[controllerIndex]) === NO;

      return skippedMiddle ? controllerIndex : i - 1;
    });
  };

  const isAnswerSelected = (
    questionKey: string | undefined,
    answerValue: string,
  ): boolean => {
    if (!questionKey) return false;

    const field = questions.find((q) => q.key === questionKey);
    const preset = field?.response_values?.[0]?.value;
    if (preset) return preset === answerValue;

    return answersRef.current[questionKey]?.value === answerValue;
  };

  return {
    questionIndex,
    handleQuestionClick,
    handleBack,
    canGoBack: questionIndex > 0,
    isAnswerSelected,
  };
}
