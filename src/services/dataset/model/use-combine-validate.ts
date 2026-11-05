import { rqClient } from "@/shared/api/instance";
import type { ApiSchemas } from "@/shared/api/schema";

export type CombineValidateRequest = ApiSchemas["CombineValidateDto"];
export type CombineValidateResponse = ApiSchemas["CombineValidateResponseDto"];
export type CombineValidationError = ApiSchemas["CombineValidationError"];
export type CombineValidationErrorCode = CombineValidationError["code"];

export function useCombineValidate() {
  const { mutateAsync, isPending, error, reset } = rqClient.useMutation(
    "post",
    "/datasets/combine/validate",
  );

  const validateCombine = (dataset_ids: string[]) =>
    mutateAsync({
      body: { dataset_ids },
    });

  return {
    validateCombine,
    isPending,
    error,
    reset,
  };
}
