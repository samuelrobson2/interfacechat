import { rqClient } from "@/shared/api/instance";

/** Query string for GET /datasets/{dataset_id}/preprocessing-credits */
export type PreprocessingCreditsQueryOpts = {
  pages_to_process?: number;
  documents_to_process?: number;
};

export const paymentQueryOptions = {
  creditsCalculation: (dataset_id: string, samples_to_process?: number) =>
    rqClient.queryOptions("get", "/datasets/{dataset_id}/credits-calculation", {
      params: {
        path: {
          dataset_id: dataset_id,
        },
        query: {
          ...(samples_to_process
            ? { samples_to_process: samples_to_process }
            : {}),
        },
      },
    }),
  preprocessingCredits: (dataset_id: string, opts?: PreprocessingCreditsQueryOpts) =>
    rqClient.queryOptions(
      "get",
      "/datasets/{dataset_id}/preprocessing-credits",
      {
        params: {
          path: {
            dataset_id,
          },
          query: {
            ...(opts?.pages_to_process != null
              ? { pages_to_process: opts.pages_to_process }
              : {}),
            ...(opts?.documents_to_process != null
              ? { documents_to_process: opts.documents_to_process }
              : {}),
          },
        },
      },
    ),
  organizationCredits: (organization_id: string) =>
    rqClient.queryOptions("get", "/organizations/{id}/credits", {
      params: {
        path: {
          id: organization_id,
        },
      },
    }),
  billingPlans: () => rqClient.queryOptions("get", "/billing/plans"),
  billingPackages: () => rqClient.queryOptions("get", "/billing/packages"),
  paymentMethods: () => rqClient.queryOptions("get", "/payment-methods"),
  paymentMethodsDefault: () =>
    rqClient.queryOptions("get", "/payment-methods/default"),
  subscription: () => rqClient.queryOptions("get", "/subscription"),
  subscriptionById: (id: string) =>
    rqClient.queryOptions("get", "/subscription/{id}", {
      params: {
        path: {
          id: id,
        },
      },
    }),
  activeGrantedPlan: () => rqClient.queryOptions("get", "/grants/active-plan"),
} as const;
