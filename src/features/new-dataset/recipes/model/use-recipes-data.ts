import { useMemo } from "react";
import { NEW_DATASET_KEYS } from "../../_lib/new-dataset-routes";
import { useDatasetStepCache } from "../../_model/use-dataset-step-query";

export function useRecipesData() {
  const data = useDatasetStepCache(NEW_DATASET_KEYS.recipes);

  const sections = useMemo(
    () =>
      Object.values(data?.step.fields || {}).sort(
        (a, b) => (a.order ?? 0) - (b.order ?? 0),
      ),
    [data],
  );

  const columns = useMemo(() => [
    {
      id: "get-started",
      title: "Get started",
      type: "free",
      items: sections.filter((s) => !s.required_plans?.length),
    },
    {
      id: "supercharge-quality",
      title: "Supercharge quality",
      type: "pro",
      items: sections.filter((s) => s.required_plans?.length),
    },
  ], [sections]);

  return {
    columns,
  };
}
