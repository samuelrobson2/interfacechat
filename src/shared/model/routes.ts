import "react-router-dom";

// Derived from the Vite base so a build with `--base=/` (e.g. the standalone
// demo) serves at the root, while the normal `/app` base is unchanged.
export const ROUTER_BASENAME =
  import.meta.env.BASE_URL.replace(/\/+$/, "") || "/";
export const TYPEFORM_LINK =
  "https://uc9yb.share.hsforms.com/2MVpe7ZdvQtCTPyqgLpMWzQ";
export const CONTACT_LINK = "mailto:sales@adaptionlabs.ai";

export const TERMS_LINK = "https://adaptionlabs.ai/terms-of-service";
export const PRIVACY_LINK = "https://adaptionlabs.ai/privacy-policy";
export const DEVELOPER_DOCS_LINK = "https://docs.adaptionlabs.ai/";
export const DISCORD_LINK = "https://discord.gg/sHhG8kwVav";
export const WEBSITE_LINK = "https://adaptionlabs.ai";
export const CONTACT_SALES_LINK = "https://adaptionlabs.ai/contact-sales";

// Homepage tab toggle (Build/Datasets vs Chat) is driven by this search param.
export const HOME_TAB_PARAM = "tab";
export const HOME_TABS = {
  BUILD: "build",
  CHAT: "chat",
  HISTORY: "history",
} as const;

const DATA_APP_ROUTES = {
  DATASETS: `/datasets`,
  DASHBOARD_DATASET: `/dataset/:dataset_id`,

  NEW_DATASET_ADAPT: `/new-dataset/adapt`,
  NEW_DATASET_INVENT: `/new-dataset/invent`,

  NEW_DATASET_ID: `/new-dataset/:dataset_id`,
  NEW_DATASET_PREPROCESSING: `/new-dataset/:dataset_id/preprocessing`,
  NEW_DATASET_PREPROCESS_FAILED: `/new-dataset/:dataset_id/preprocessing/failed`,
  NEW_DATASET_QUESTIONNAIRE: `/new-dataset/:dataset_id/questionnaire`,
  NEW_DATASET_MAPPING: `/new-dataset/:dataset_id/mapping`,
  NEW_DATASET_DATA_DIAGNOSIS: `/new-dataset/:dataset_id/data-diagnosis`,
  NEW_DATASET_RECIPES: `/new-dataset/:dataset_id/recipes`,
  NEW_DATASET_CONTROL_BRAND: `/new-dataset/:dataset_id/control-brand`,
  NEW_DATASET_GROW: `/new-dataset/:dataset_id/grow`,
  NEW_DATASET_SUMMARY: `/new-dataset/:dataset_id/summary`,

  DATASET_FINETUNE: `/dataset/:dataset_id/finetune`,
  DATASET_FINETUNE_TRAINING_METHOD: `/dataset/:dataset_id/finetune/training-method`,
  // DATASET_FINETUNE_MODEL: `/dataset/:dataset_id/finetune/model`,
  DATASET_FINETUNE_COLUMNS: `/dataset/:dataset_id/finetune/columns`,
  DATASET_FINETUNE_AUGMENTATION: `/dataset/:dataset_id/finetune/augmentation`,
  DATASET_FINETUNE_RECIPE_PREPARING: `/dataset/:dataset_id/finetune/recipe-preparing`,
  DATASET_FINETUNE_CREDITS: `/dataset/:dataset_id/finetune/credits`,
  DATASET_FINETUNE_HYPERPARAMETERS: `/dataset/:dataset_id/finetune/hyperparameters`,
  DATASET_FINETUNE_CONFIRM: `/dataset/:dataset_id/finetune/confirm`,
  DATASET_FINETUNE_LAUNCH_SUCCESS: `/dataset/:dataset_id/finetune/launch-success`,
  DATASET_FINETUNE_LAUNCH_FAILED: `/dataset/:dataset_id/finetune/launch-failed`,
  DATASET_FINETUNE_STEP: `/dataset/:dataset_id/finetune/step/:step_key`,

  DATASET_AUTOSCIENTIST_DASHBOARD: `/autoscienstist`,
} as const;

const CHAT_APP_ROUTES = {
  CHAT: `/chat/:chat_id`,
  CHAT_FOLDERS: `/chat-folders`,
  CHAT_FOLDER: `/chat-folders/:folder_id`,
  // The pristine, unmodified pharos "New Chat" experience, kept as its own
  // route alongside the homepage's customized Chat tab (see home.page.tsx).
  NEW_CHAT_ORIGINAL: `/new-chat`,
  CHAT_VISUALIZE: `/chat/visualize`,
  CHAT_VISUALIZE_SESSION: `/chat/visualize/:chat_id`,
} as const;

export const VISUALIZE_DATASET_PARAM = "dataset_id";

export const NEW_DATASET_RETURN_PARAM = "return_to";
export const NEW_DATASET_RETURN_TO = {
  VISUALIZE: "visualize",
} as const;

export type NewDatasetReturnTo =
  (typeof NEW_DATASET_RETURN_TO)[keyof typeof NEW_DATASET_RETURN_TO];

export const ROUTES = {
  HOME: "/",
  // The pharos chat surface (vendored from pharos main) streamed from an
  // OpenAI model instead of the pharos backend, for iterating on chat.
  CHAT_LAB: "/chat-lab",
  CHAT_LAB_SESSION: "/chat-lab/:chat_id",
  UI_KIT: "/ui-kit",
  UI_KIT_COMPONENTS: "/ui-kit/components",
  UI_KIT_ICONS: "/ui-kit/icons",
  UI_KIT_COLORS: "/ui-kit/colors",
  UI_KIT_3D_IMAGES: "/ui-kit/3d-images",
  UI_KIT_ADDITIONS: "/ui-kit/additions",
  UI_KIT_ANIMATED_ICONS: "/ui-kit/animated-icons",
  // A gallery of common UI patterns built as small standalone demos.
  COMMON_UI_EXAMPLES: "/common-ui-examples",
  COMMON_UI_EXAMPLES_DOCUMENT_ANALYSER: "/common-ui-examples/document-analyser",
  // The mini interface shells chat opens (document, search, table), live at
  // every size: app icon, idle, filling in, and docked.
  INTERFACE_LIBRARY: "/interface-library",
  // Every interface in every size and state, with no other text, for Figma.
  INTERFACE_STATES: "/interface-states",
  // A test bed for the flexible workspace before it goes into chat.
  WORKBENCH: "/workbench",
  USER_PROFILE: "/user-profile",
  SETTINGS: "/settings",
  PLANS: "/plans",
  WELCOME: "/welcome",
  SIGNIN: "/auth",
  SIGNUP_PASSWORD: "/auth/signup/password",
  NOTIFY_EMAIL: "/auth/notify-email",
  VERIFY_EMAIL: "/auth/verify-email",
  PHONE_AUTH: "/auth/phone",
  PHONE_AUTH_OTP: "/auth/phone/otp",
  GOOGLE_CALLBACK: "/auth/google/callback",
  SETUP_PROFILE: "/auth/setup-profile",
  RESET_PASSWORD: "/auth/reset-password",
  RESET_PASSWORD_CHECK_EMAIL: "/auth/reset-password/check-email",
  CREATE_NEW_PASSWORD: "/auth/create-new-password",
  CREATE_NEW_PASSWORD_SUCCESS: "/auth/create-new-password/success",
  CREATE_NEW_PASSWORD_ERROR: "/auth/create-new-password/error",

  ...DATA_APP_ROUTES,
  ...CHAT_APP_ROUTES,
} as const;

export type HomeTab = (typeof HOME_TABS)[keyof typeof HOME_TABS];

/** Builds a link to the homepage with a specific tab preselected. */
export const homeTabPath = (tab: HomeTab) =>
  `${ROUTES.HOME}?${HOME_TAB_PARAM}=${tab}`;

/** Builds a link to the Visualize page, optionally preselecting a dataset. */
export const visualizePath = (datasetId?: string) =>
  datasetId
    ? `${ROUTES.CHAT_VISUALIZE}?${VISUALIZE_DATASET_PARAM}=${datasetId}`
    : ROUTES.CHAT_VISUALIZE;

export const newDatasetAdaptPath = (
  returnTo?: NewDatasetReturnTo,
  datasetId?: string,
) => {
  const params = new URLSearchParams();
  if (returnTo) params.set(NEW_DATASET_RETURN_PARAM, returnTo);
  if (datasetId) params.set(VISUALIZE_DATASET_PARAM, datasetId);
  const query = params.toString();
  return query
    ? `${ROUTES.NEW_DATASET_ADAPT}?${query}`
    : ROUTES.NEW_DATASET_ADAPT;
};

export type DatasetRoutes =
  | typeof ROUTES.NEW_DATASET_ID
  | typeof ROUTES.NEW_DATASET_PREPROCESSING
  | typeof ROUTES.NEW_DATASET_PREPROCESS_FAILED
  | typeof ROUTES.NEW_DATASET_MAPPING
  | typeof ROUTES.NEW_DATASET_QUESTIONNAIRE
  | typeof ROUTES.NEW_DATASET_DATA_DIAGNOSIS
  | typeof ROUTES.NEW_DATASET_RECIPES
  | typeof ROUTES.NEW_DATASET_CONTROL_BRAND
  | typeof ROUTES.NEW_DATASET_GROW
  | typeof ROUTES.NEW_DATASET_SUMMARY
  | typeof ROUTES.DATASET_FINETUNE
  | typeof ROUTES.DATASET_FINETUNE_TRAINING_METHOD
  // | typeof ROUTES.DATASET_FINETUNE_MODEL
  | typeof ROUTES.DATASET_FINETUNE_COLUMNS
  | typeof ROUTES.DATASET_FINETUNE_AUGMENTATION
  | typeof ROUTES.DATASET_FINETUNE_CREDITS
  | typeof ROUTES.DATASET_FINETUNE_HYPERPARAMETERS
  | typeof ROUTES.DATASET_FINETUNE_CONFIRM
  | typeof ROUTES.DATASET_FINETUNE_LAUNCH_SUCCESS
  | typeof ROUTES.DATASET_FINETUNE_LAUNCH_FAILED
  | typeof ROUTES.DATASET_FINETUNE_STEP;

export type PathParams = {
  [key in DatasetRoutes]: {
    dataset_id: string;
  };
} & {
  [ROUTES.DATASET_FINETUNE_STEP]: {
    dataset_id: string;
    step_key: string;
  };
  [CHAT_APP_ROUTES.CHAT_FOLDER]: {
    folder_id: string;
  };
  [CHAT_APP_ROUTES.CHAT]: {
    chat_id: string;
  };
  [CHAT_APP_ROUTES.CHAT_VISUALIZE_SESSION]: {
    chat_id: string;
  };
  [ROUTES.CHAT_LAB_SESSION]: {
    chat_id: string;
  };
};

export type ApiErrorData = {
  message: string;
  description?: string;
};

declare module "react-router-dom" {
  interface Register {
    params: PathParams;
  }
}
