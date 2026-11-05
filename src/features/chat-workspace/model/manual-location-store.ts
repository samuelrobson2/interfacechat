import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { ResolvedLocation } from "@/shared/lib/google/geocoding";

interface ManualLocationState {
  location: ResolvedLocation | null;
  setLocation: (location: ResolvedLocation) => void;
  clearLocation: () => void;
}

/**
 * Holds a user-picked location that overrides browser geolocation and the
 * profile-country fallback. Persisted so the choice survives reloads.
 */
export const useManualLocationStore = create<ManualLocationState>()(
  persist(
    (set) => ({
      location: null,
      setLocation: (location) => set({ location }),
      clearLocation: () => set({ location: null }),
    }),
    {
      name: "manual-location",
    },
  ),
);
