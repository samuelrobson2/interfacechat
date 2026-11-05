import { CONFIG } from "@/shared/model/config";
import { useSuspenseQuery } from "@tanstack/react-query";
import posthog, { type Survey } from "posthog-js";

export function useFeedbackDataSuspense() {
  const { data: survey } = useSuspenseQuery<Survey>({
    queryKey: ["posthog-surveys"],
    queryFn: () => {
      return new Promise<Survey>((resolve, reject) => {
        try {
          // Wait for surveys to be loaded before fetching them
          posthog.onSurveysLoaded(() => {
            posthog.getActiveMatchingSurveys((surveys) => {
              const survey = surveys.find((survey) => survey.id === CONFIG.POSTHOG_SURVEY_ID);
              if (!survey) return reject(new Error("Survey not found"));

              resolve(survey);
            });
          });
        } catch (err) {
          reject(err);
        }
      });
    },
    staleTime: 5 * 60 * 1000, // Cache surveys for 5 minutes
  });

  return {
    survey
  };
}