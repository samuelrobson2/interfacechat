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
import { data as dataResponse, matchPath, redirect } from "react-router-dom";
import {
  FINETUNE_ROUTES_BY_STEP_KEY,
  FINETUNE_STEP_KEYS,
  type FinetuneStepKey,
} from "../_lib/finetune-routes";
import { resolveFinetuneStepRoute } from "../_lib/resolve-finetune-step-route";
import { getFinetuneStepsData } from "./get-finetune-steps-data";

const FINETUNE_MOCK_STEP_KEYS = new Set<FinetuneStepKey>([
  FINETUNE_STEP_KEYS.trainingMethod,
  FINETUNE_STEP_KEYS.columns,
  FINETUNE_STEP_KEYS.augmentation,
  FINETUNE_STEP_KEYS.credits,
  FINETUNE_STEP_KEYS.confirm,
]);

async function fetchFinetuneSteps(datasetId: string, withCache = false) {
  const data = await getFinetuneStepsData(datasetId, withCache);
  if (!data?.steps || data.steps.length === 0) {
    throw dataResponse<ApiErrorData>(
      { message: "Finetune steps not found" },
      404,
    );
  }

  return data.steps.slice().sort((a, b) => a.order - b.order);
}

function getCurrentStep(steps: ApiSchemas["FinetuneStepDto"][]) {
  const completedSteps = steps.filter((step) => step.completed);
  if (completedSteps.length === 0) return steps[0];
  return completedSteps.at(-1);
}

function canAccessTargetStep(
  steps: ApiSchemas["FinetuneStepDto"][],
  currentStep: ApiSchemas["FinetuneStepDto"],
  targetStep: ApiSchemas["FinetuneStepDto"],
) {
  if (targetStep.order <= currentStep.order + 1) return true;

  const currentIndex = steps.findIndex((step) => step.key === currentStep.key);
  const targetIndex = steps.findIndex((step) => step.key === targetStep.key);
  if (currentIndex < 0 || targetIndex < 0 || targetIndex <= currentIndex) return false;

  // Allow walking through a chain of mock-only intermediate steps
  // without requiring backend completion updates for each mock step.
  const intermediateSteps = steps.slice(currentIndex + 1, targetIndex);
  return intermediateSteps.every((step) =>
    FINETUNE_MOCK_STEP_KEYS.has(step.key as FinetuneStepKey),
  );
}

function validateAccess(
  steps: ApiSchemas["FinetuneStepDto"][],
  pathname: string,
  datasetId: string,
  search: string,
) {
  const currentStep = getCurrentStep(steps);
  const targetRouteStepKey = Object.entries(FINETUNE_ROUTES_BY_STEP_KEY).find(
    ([, route]) => (route ? matchPath(route, pathname) : false),
  )?.[0] as FinetuneStepKey | undefined;
  const dynamicStepMatch = matchPath(ROUTES.DATASET_FINETUNE_STEP, pathname);
  const dynamicStepKey = dynamicStepMatch?.params?.step_key
    ? decodeURIComponent(dynamicStepMatch.params.step_key)
    : undefined;

  const targetStep = dynamicStepKey
    ? steps.find((step) => step.key === dynamicStepKey)
    : targetRouteStepKey
      ? steps.find((step) => step.key === targetRouteStepKey)
      : undefined;

  if (!currentStep) return null;

  if ((dynamicStepKey || targetRouteStepKey) && !targetStep) {
    return redirect(`${resolveFinetuneStepRoute(datasetId, currentStep.key)}${search}`);
  }

  if (targetStep && !canAccessTargetStep(steps, currentStep, targetStep)) {
    return redirect(`${resolveFinetuneStepRoute(datasetId, currentStep.key)}${search}`);
  }

  return null;
}

export async function finetuneStepsLoader({
  params,
  request,
}: LoaderFunctionArgs) {
  const { dataset_id } = params as PathParams[DatasetRoutes];
  if (!dataset_id) {
    throw redirect(homeTabPath(HOME_TABS.BUILD));
  }

  const requestUrl = new URL(request.url);
  const rawPathname = requestUrl.pathname;
  const search = requestUrl.search;
  const pathname = rawPathname.startsWith(ROUTER_BASENAME)
    ? rawPathname.slice(ROUTER_BASENAME.length) || "/"
    : rawPathname;

  const isParentRoute = matchPath(ROUTES.DATASET_FINETUNE, pathname);
  if (isParentRoute) {
    const steps = await fetchFinetuneSteps(dataset_id, false);
    const currentStep = getCurrentStep(steps);
    if (!currentStep) {
      throw dataResponse<ApiErrorData>(
        { message: "Finetune steps not found" },
        404,
      );
    }
    return redirect(`${resolveFinetuneStepRoute(dataset_id, currentStep.key)}${search}`);
  }

  const steps = await fetchFinetuneSteps(dataset_id, true);
  const redirectResponse = validateAccess(steps, pathname, dataset_id, search);
  if (redirectResponse) return redirectResponse;

  return steps;
}
