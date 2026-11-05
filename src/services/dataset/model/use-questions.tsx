import { useRef, useState } from "react";

const NO = "false";

type QuestionShape = {
  key: string;
  relation?: string | null;
  response_values?: Array<{ value?: string }> | null;
};

export function useQuestions<Q extends QuestionShape>({
  onComplete,
  questions,
  /** When true, selecting `"false"` on the first question calls `onComplete` immediately (skips remaining questions). */
  completeEarlyOnFirstFalse = false,
}: {
  onComplete: (answers: Record<string, { value: string }>) => void;
  questions: Q[];
  completeEarlyOnFirstFalse?: boolean;
}) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const answersRef = useRef<Record<string, { value: string }>>({});
  const n = questions.length;

  const getFieldAnswer = (field?: Q) =>
    field
      ? answersRef.current[field.key]?.value ||
        field.response_values?.[0]?.value
      : undefined;

  const handleQuestionClick = (field: Q, value: string) => {
    answersRef.current[field.key] = { value };

    if (completeEarlyOnFirstFalse && questionIndex === 0 && value === NO) {
      onComplete(answersRef.current);
      return;
    }

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
