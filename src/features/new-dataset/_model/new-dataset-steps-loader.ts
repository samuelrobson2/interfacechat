import { datasetQueryOptions } from "@/services/dataset";
import { queryClient } from "@/shared/api/query-client";
import type { ApiSchemas } from "@/shared/api/schema";
import {
  HOME_TABS,
  homeTabPath,
  ROUTER_BASENAME,
  ROUTES,
  type ApiErrorData,
  type DatasetRoutes,
  type PathParams,
} from "@/shared/model/routes";
import type { LoaderFunctionArgs } from "react-router-dom";
import {
  data as dataResponse,
  href,
  matchPath,
  redirect,
} from "react-router-dom";
import {
  NEW_DATASET_ROUTES_MAP,
  type NewDatasetKeys,
} from "../_lib/new-dataset-routes";

async function getDatasetStepsData(
  dataset_id: string,
  withCache: boolean = false,
) {
  if (withCache) {
    const cachedData = queryClient.getQueryData<
      ApiSchemas["DatasetStepsResponseDto"]
    >(datasetQueryOptions.steps(dataset_id!).queryKey);

    if (cachedData) return cachedData;
  }

  return await queryClient.fetchQuery(datasetQueryOptions.steps(dataset_id));
}

async function fetchDatasetSteps(
  dataset_id: string,
  withCache: boolean = false,
) {
  const data = await getDatasetStepsData(dataset_id, withCache);

  if (!data?.steps)
    throw dataResponse<ApiErrorData>(
      { message: "Dataset steps not found" },
      404,
    );

  const userFacingSteps = data.steps.filter(
    (step) => step.key in NEW_DATASET_ROUTES_MAP,
  );
  const sortedSteps = userFacingSteps.sort((a, b) => a.order - b.order);

  return sortedSteps;
}

function getCurrentStep(steps: ApiSchemas["Step"][]) {
  return steps.find((step) => step.completed === false);
}

function getCurrentRoute(step?: ApiSchemas["Step"]) {
  if (!step) return ROUTES.NEW_DATASET_QUESTIONNAIRE;
  return (
    NEW_DATASET_ROUTES_MAP[step.key as NewDatasetKeys] ??
    ROUTES.NEW_DATASET_QUESTIONNAIRE
  );
}

function validateAccess(
  steps: ApiSchemas["Step"][],
  pathname: string,
  dataset_id: string,
): ReturnType<typeof redirect> | null {
  const currentStep = getCurrentStep(steps);

  // Determine which step user is trying to access from pathname
  const targetStepKey = Object.entries(NEW_DATASET_ROUTES_MAP).find(
    ([, route]) => {
      return matchPath(route, pathname);
    },
  )?.[0];

  // If we found target step, validate access
  if (targetStepKey && currentStep) {
    const targetStep = steps.find((step) => step.key === targetStepKey);
    const currentStepRoute = getCurrentRoute(currentStep);

    // If target step order is greater than current step order, redirect to current step
    if (!targetStep || (targetStep && targetStep.order > currentStep.order)) {
      return redirect(href(currentStepRoute, { dataset_id }));
    }
  }

  return null;
}

export async function newDatasetStepsLoader({
  params,
  request,
}: LoaderFunctionArgs) {
  const { dataset_id } = params as PathParams[DatasetRoutes];

  if (!dataset_id) {
    throw redirect(homeTabPath(HOME_TABS.BUILD));
  }

  const rawPathname = new URL(request.url).pathname;
  // Strip basename so matchPath works with route patterns that don't include it
  const pathname = rawPathname.startsWith(ROUTER_BASENAME)
    ? rawPathname.slice(ROUTER_BASENAME.length) || "/"
    : rawPathname;

  const isParentRoute = matchPath(ROUTES.NEW_DATASET_ID, pathname);

  // Dataset ID Route - redirect to current step
  if (isParentRoute) {
    const steps = await fetchDatasetSteps(dataset_id);
    const currentStepRoute = getCurrentRoute(getCurrentStep(steps));

    return redirect(href(currentStepRoute, { dataset_id }));
  }

  // Dataset Steps Route - check access to the step and redirect to current step if needed
  const steps = await fetchDatasetSteps(dataset_id, true);
  const redirectResponse = validateAccess(steps, pathname, dataset_id);

  if (redirectResponse) return redirectResponse;

  return steps;
}
