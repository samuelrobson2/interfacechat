import { datasetStepsLoader } from "@/features/new-dataset";
import { finetuneStepsLoader } from "@/features/dataset-finetune";
import { paymentLoader } from "@/services/payment";
import { ROUTES } from "@/shared/model/routes";
import type { RouteObject } from "react-router-dom";
import { Outlet } from "react-router-dom";

export const dataAppRoutes: RouteObject[] = [
  // DASHBOARD ROUTES
  {
    path: ROUTES.DATASETS,
    lazy: () => import("@/features/dataset-dashboard/datasets/dashboard.page"),
  },
  {
    path: ROUTES.DASHBOARD_DATASET,
    lazy: () => import("@/features/dataset-dashboard/dataset/dataset.page"),
  },
  // NEW DATASET ROUTES
  {
    path: ROUTES.NEW_DATASET_ADAPT,
    lazy: () => import("@/features/new-dataset/adapt/new-dataset-adapt.page"),
  },
  {
    path: ROUTES.NEW_DATASET_INVENT,
    lazy: () => import("@/features/new-dataset/invent/new-dataset-invent.page"),
  },
  {
    path: ROUTES.DATASET_AUTOSCIENTIST_DASHBOARD,
    lazy: () =>
      import("@/features/dataset-dashboard/datasets/autoscientist-dashboard.page"),
  },
  {
    path: ROUTES.NEW_DATASET_ID,
    id: "dataset-steps",
    loader: datasetStepsLoader,
    element: <Outlet />,
    children: [
      {
        path: ROUTES.NEW_DATASET_QUESTIONNAIRE,
        lazy: () =>
          import("@/features/new-dataset/questionnaire/new-dataset-questionnaire.page"),
      },
      {
        path: ROUTES.NEW_DATASET_PREPROCESSING,
        lazy: () =>
          import("@/features/new-dataset/preprocessing/new-dataset-preprocessing-question.page"),
      },
      {
        path: ROUTES.NEW_DATASET_PREPROCESS_FAILED,
        lazy: () =>
          import("@/features/new-dataset/preprocessing-failed/new-dataset-preprocessing-failed.page"),
      },
      {
        path: ROUTES.NEW_DATASET_MAPPING,
        lazy: () =>
          import("@/features/new-dataset/mapping/new-dataset-mapping.page"),
      },
      {
        path: ROUTES.NEW_DATASET_DATA_DIAGNOSIS,
        lazy: () =>
          import("@/features/new-dataset/data-diagnosis/new-dataset-data-diagnosis.page"),
      },
      {
        path: ROUTES.NEW_DATASET_RECIPES,
        lazy: () =>
          import("@/features/new-dataset/recipes/new-dataset-recipes.page"),
      },
      {
        path: ROUTES.NEW_DATASET_CONTROL_BRAND,
        lazy: () =>
          import("@/features/new-dataset/control-brand/new-dataset-control-brand.page"),
      },
      {
        path: ROUTES.NEW_DATASET_GROW,
        lazy: () => import("@/features/new-dataset/grow/new-dataset-grow.page"),
      },
      {
        path: ROUTES.NEW_DATASET_SUMMARY,
        loader: paymentLoader("top-up"),
        lazy: () =>
          import("@/features/new-dataset/summary/new-dataset-summary.page"),
      },
    ],
  },
  // DATASET FINETUNE ROUTES
  {
    path: ROUTES.DATASET_FINETUNE_TRAINING_METHOD,
    lazy: () =>
      import("@/features/dataset-finetune/training-method/dataset-finetune-training-method.page"),
  },
  {
    path: ROUTES.DATASET_FINETUNE_COLUMNS,
    loader: finetuneStepsLoader,
    lazy: () =>
      import("@/features/dataset-finetune/columns/dataset-finetune-columns.page"),
  },
  {
    path: ROUTES.DATASET_FINETUNE_AUGMENTATION,
    loader: finetuneStepsLoader,
    lazy: () =>
      import("@/features/dataset-finetune/augmentation/dataset-finetune-augmentation.page"),
  },
  {
    path: ROUTES.DATASET_FINETUNE_CREDITS,
    loader: paymentLoader("top-up"),
    lazy: () =>
      import("@/features/dataset-finetune/credits/dataset-finetune-credits.page"),
  },
  {
    path: ROUTES.DATASET_FINETUNE,
    loader: finetuneStepsLoader,
  },
  // {
  //   path: ROUTES.DATASET_FINETUNE_MODEL,
  //   loader: finetuneStepsLoader,
  //   lazy: () =>
  //     import("@/features/dataset-finetune/chose-model/dataset-finetune-model.page"),
  // },
  {
    path: ROUTES.DATASET_FINETUNE_HYPERPARAMETERS,
    loader: finetuneStepsLoader,
    lazy: () =>
      import("@/features/dataset-finetune/hyperparameters/dataset-finetune-hyperparameters.page"),
  },
  {
    path: ROUTES.DATASET_FINETUNE_CONFIRM,
    loader: finetuneStepsLoader,
    lazy: () =>
      import("@/features/dataset-finetune/confirm/dataset-finetune-confirm.page"),
  },
  {
    path: ROUTES.DATASET_FINETUNE_LAUNCH_SUCCESS,
    lazy: () =>
      import("@/features/dataset-finetune/confirm/success/dataset-finetune-launch-success.page"),
  },
  {
    path: ROUTES.DATASET_FINETUNE_LAUNCH_FAILED,
    lazy: () =>
      import("@/features/dataset-finetune/confirm/failed/dataset-finetune-launch-failed.page"),
  },
  {
    path: ROUTES.DATASET_FINETUNE_STEP,
    loader: finetuneStepsLoader,
    lazy: () =>
      import("@/features/dataset-finetune/step/dataset-finetune-step.page"),
  },
];
