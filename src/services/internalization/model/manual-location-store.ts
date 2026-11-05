import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { ResolvedLocation } from "@/shared/lib/google/geocoding";

import type { TemperatureUnit } from "../lib/temperature-units";

interface ManualLocationState {
  location: ResolvedLocation | null;
  temperatureUnit: TemperatureUnit | null;
  setLocation: (location: ResolvedLocation) => void;
  clearLocation: () => void;
  setTemperatureUnit: (unit: TemperatureUnit) => void;
}

/**
 * Holds a user-picked location that overrides browser geolocation and the
 * profile-country fallback. Persisted so the choice survives reloads.
 */
export const useManualLocationStore = create<ManualLocationState>()(
  persist(
    (set) => ({
      location: null,
      temperatureUnit: null,
      setLocation: (location) => set({ location }),
      clearLocation: () => set({ location: null }),
      setTemperatureUnit: (unit) => set({ temperatureUnit: unit }),
    }),
    {
      name: "manual-location",
    },
  ),
);
