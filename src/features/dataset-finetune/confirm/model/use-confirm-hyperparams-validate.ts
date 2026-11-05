import { useEffect, useRef, useState } from "react";
import { rqClient } from "@/shared/api/instance";

const DEBOUNCE_MS = 250;

export type ConfirmHyperparamsErrors = Record<string, string[]>;

/**
 * Validates the parsed hyperparams blob from the confirm-step JSON editor.
 * Same /finetune/hyperparams/validate endpoint as the recipe editor uses,
 * but without the FE-side string→type coercion: the JSON editor already
 * yields a plain object with the right primitive types.
 *
 * Skips when payload is null/undefined (caller handles syntax errors
 * separately via JSON.parse). Debounces and tracks the latest call so
 * out-of-order responses don't clobber a newer answer.
 */
export function useConfirmHyperparamsValidate({
  datasetId,
  hyperparams,
}: {
  datasetId: string | undefined;
  hyperparams: Record<string, unknown> | null | undefined;
}): { errors: ConfirmHyperparamsErrors; isValidating: boolean } {
  const [errors, setErrors] = useState<ConfirmHyperparamsErrors>({});
  const [isValidating, setIsValidating] = useState(false);
  const latestCallId = useRef(0);

  const { mutateAsync } = rqClient.useMutation(
    "post",
    "/datasets/{dataset_id}/finetune/hyperparams/validate",
  );

  useEffect(() => {
    // Bump the call id even on the early-return so any in-flight response
    // from a prior effect invocation gets discarded. Without this, the
    // user breaks JSON syntax (clears errors), then the stale response
    // for the previous payload lands and re-populates the errors map —
    // briefly flashing them and re-disabling "Done" / "Launch" until the
    // next debounced call completes.
    const callId = ++latestCallId.current;
    if (!datasetId || !hyperparams) {
      setErrors({});
      return;
    }
    const timer = setTimeout(() => {
      setIsValidating(true);
      (async () => {
        try {
          const result = await mutateAsync({
            params: { path: { dataset_id: datasetId } },
            body: hyperparams,
          });
          if (callId !== latestCallId.current) return;
          setErrors(result.errors);
        } catch {
          if (callId !== latestCallId.current) return;
          setErrors({});
        } finally {
          if (callId === latestCallId.current) {
            setIsValidating(false);
          }
        }
      })();
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [datasetId, hyperparams, mutateAsync]);

  return { errors, isValidating };
}
