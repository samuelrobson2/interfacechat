import { useSessionStore } from "@/services/auth";
import type { ApiSchemas } from "@/shared/api/schema";
import { useMemo } from "react";

type SetupStep = "name" | "countries" | "languages" | "domains" | "welcome";

const setupStepsFields: SetupStep[] = [
  "name",
  "languages",
  "countries",
  "domains",
];

export function useSetupProfile() {
  const user = useSessionStore((state) => state.user);

  const currentSetupState: SetupStep = useMemo(() => {
    if (!user || !user.profile) return "name";

    let completedSteps = 0;

    for (const field of setupStepsFields) {
      if (!(field in user.profile)) continue;

      const profileField =
        user.profile[field as keyof ApiSchemas["UserProfile"]];

      if (Array.isArray(profileField) && profileField.length === 0) {
        return field;
      }
      if (!profileField) return field;

      completedSteps++;
    }

    if (completedSteps === setupStepsFields.length) return "welcome";
    return "name";
  }, [user]);

  return {
    currentSetupState,
  };
}
