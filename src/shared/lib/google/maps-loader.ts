import { CONFIG } from "@/shared/model/config";

let loadPromise: Promise<void> | null = null;
const CALLBACK_NAME = "__pharosGoogleMapsLoaded";

/**
 * Lazily loads the Google Maps JS API (geocoding library). Routing geocoding
 * through the JS SDK lets a referrer-restricted API key work — the legacy
 * Geocoding web service rejects referrer-restricted keys.
 */
export const loadGoogleMaps = (): Promise<void> => {
  if (loadPromise) return loadPromise;

  loadPromise = new Promise<void>((resolve, reject) => {
    if (typeof window === "undefined" || typeof document === "undefined") {
      reject(new Error("Google Maps can only load in the browser"));
      return;
    }
    if (window.google?.maps?.Geocoder) {
      resolve();
      return;
    }

    const globalWindow = window as typeof window & Record<string, unknown>;
    globalWindow[CALLBACK_NAME] = () => resolve();

    const params = new URLSearchParams({
      key: CONFIG.GOOGLE_MAPS_API_KEY,
      libraries: "geocoding",
      loading: "async",
      callback: CALLBACK_NAME,
    });
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
    script.async = true;
    script.onerror = () => {
      // Allow a retry after a transient network failure.
      loadPromise = null;
      reject(new Error("Failed to load the Google Maps JS API"));
    };
    document.head.appendChild(script);
  });

  return loadPromise;
};
