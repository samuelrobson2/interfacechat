/// <reference types="vite/client" />
/// <reference types="google.maps" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_APP_ENV?: "dev" | "stage" | "production";
  readonly VITE_AUTH_BYPASS?: "true" | "false";
  readonly VITE_PUBLIC_CLOUDINARY_NAME: string;
  readonly VITE_GOOGLE_MAPS_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  google?: typeof google;
}
