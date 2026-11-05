import { rqClient } from "@/shared/api/instance";
import type { ApiSchemas } from "@/shared/api/schema";

export type CombineDatasetsRequest = ApiSchemas["CombineDatasetsDto"];
export type CombineDatasetsResponse = ApiSchemas["CombineDatasetsResponseDto"];

type CombineDatasetsArgs = CombineDatasetsRequest & {
  /**
   * Optional override for the `Idempotency-Key` header. When omitted, a fresh
   * `crypto.randomUUID()` is generated per call. Pass an explicit key when the
   * caller needs to retry a previously-attempted combine.
   */
  idempotencyKey?: string;
};

export function useCombineDatasets() {
  const { mutateAsync, isPending, error, reset } = rqClient.useMutation(
    "post",
    "/datasets/combine",
  );

  const combineDatasets = ({
    dataset_ids,
    name,
    idempotencyKey,
  }: CombineDatasetsArgs) =>
    mutateAsync({
      params: {
        header: {
          "Idempotency-Key": idempotencyKey ?? crypto.randomUUID(),
        },
      },
      body: { dataset_ids, name },
    });

  return {
    combineDatasets,
    isPending,
    error,
    reset,
  };
}
