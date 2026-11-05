const APP_ENV = import.meta.env.VITE_APP_ENV as
  | "dev"
  | "stage"
  | "production"
  | undefined;

export const CONFIG = {
  DEV: import.meta.env.DEV,
  APP_ENV,
  MAINTENANCE_MODE_ENABLED: import.meta.env.VITE_MAINTENANCE_MODE_ENABLED,
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  POSTHOG_API_KEY: import.meta.env.VITE_PUBLIC_POSTHOG_KEY,
  POSTHOG_HOST: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
  POSTHOG_SURVEY_ID: import.meta.env.VITE_PUBLIC_SURVEY_ID,
  CLOUDINARY_CLOUD_NAME: import.meta.env.VITE_PUBLIC_CLOUDINARY_NAME,
  GOOGLE_MAPS_API_KEY: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
};
