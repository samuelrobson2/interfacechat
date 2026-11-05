import { useMemo, useState } from "react";
import { PASSWORD_REQUIREMENTS, passwordSchema } from "../lib/password-schema";
import { debounce } from "@/shared/lib/js";

export const usePasswordStrengthCheck = () => {
  const [failedRequirements, setFailedRequirements] = useState<Set<string>>(
    new Set(Object.values(PASSWORD_REQUIREMENTS)),
  );

  const checkPassword = useMemo(
    () =>
      debounce((password: string) => {
        const result = passwordSchema.safeParse(password);

        if (result.error) {
          const failed = new Set<string>();
          result.error.issues.forEach((issue) => {
            failed.add(issue.message);
          });
          setFailedRequirements(failed);
        } else {
          setFailedRequirements(new Set());
        }
      }, 300),
    [],
  );

  const handlePasswordInput = (e: React.FormEvent<HTMLInputElement>) => {
    checkPassword(e.currentTarget.value);
  };

  return {
    failedRequirements,
    handlePasswordInput,
  };
};
