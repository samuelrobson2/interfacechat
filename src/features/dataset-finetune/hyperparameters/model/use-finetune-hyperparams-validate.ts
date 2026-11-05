import { useEffect, useMemo, useRef, useState } from "react";
import { rqClient } from "@/shared/api/instance";
import {
  draftToValidatePayload,
  dtoFieldToDraftKey,
  type FinetuneHyperparamErrors,
} from "../lib/draft-to-validate-payload";
import type { FinetuneHyperparamDraft } from "../lib/finetune-hyperparam-cards";

const DEBOUNCE_MS = 250;

/**
 * Asks the BE whether the current draft would pass validation.
 *
 * Local errors (NaN inputs like "abc" in n_epochs) are tracked separately
 * from BE errors and applied synchronously on every render — they're free
 * to compute and the user shouldn't have to wait the full debounce +
 * round-trip to see "must be a number" feedback. BE errors arrive after
 * the debounce; we track the latest call so out-of-order responses don't
 * clobber a newer answer. The merged view favors local on conflict (newer
 * input wins over a stale round-trip).
 */
export function useFinetuneHyperparamsValidate({
  datasetId,
  draft,
  enabled = true,
}: {
  datasetId: string | undefined;
  draft: FinetuneHyperparamDraft;
  enabled?: boolean;
}): { errors: FinetuneHyperparamErrors; isValidating: boolean } {
  const [remoteErrors, setRemoteErrors] = useState<FinetuneHyperparamErrors>(
    {},
  );
  const [isValidating, setIsValidating] = useState(false);
  const latestCallId = useRef(0);

  const { mutateAsync } = rqClient.useMutation(
    "post",
    "/datasets/{dataset_id}/finetune/hyperparams/validate",
  );
  const mutateAsyncRef = useRef(mutateAsync);
  mutateAsyncRef.current = mutateAsync;

  const { payload, localErrors } = useMemo(
    () => draftToValidatePayload(draft),
    [draft],
  );

  const payloadKey = useMemo(() => JSON.stringify(payload), [payload]);

  useEffect(() => {
    const callId = ++latestCallId.current;

    if (!datasetId || !enabled) {
      setIsValidating(false);
      return;
    }

    const timer = setTimeout(() => {
      setIsValidating(true);
      (async () => {
        try {
          const result = await mutateAsyncRef.current({
            params: { path: { dataset_id: datasetId } },
            body: payload,
          });
          if (callId !== latestCallId.current) return;
          const next: FinetuneHyperparamErrors = {};
          for (const [field, messages] of Object.entries(result.errors)) {
            const draftKey = dtoFieldToDraftKey(field);
            if (draftKey) next[draftKey] = messages;
          }
          setRemoteErrors(next);
        } catch {
          if (callId !== latestCallId.current) return;
          setRemoteErrors({});
        } finally {
          if (callId === latestCallId.current) {
            setIsValidating(false);
          }
        }
      })();
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [datasetId, enabled, payload, payloadKey]);

  const errors = useMemo<FinetuneHyperparamErrors>(
    () => ({ ...remoteErrors, ...localErrors }),
    [remoteErrors, localErrors],
  );

  return { errors, isValidating };
}
