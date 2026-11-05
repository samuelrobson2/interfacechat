import { useMemo, useState } from "react";

import {
  geocodeByPlaceId,
  reverseGeocode,
} from "@/shared/lib/google/geocoding";
import type { PlacePrediction } from "@/shared/lib/google/places";
import { debounce } from "@/shared/lib/js";
import { useGeolocation } from "@/shared/lib/react/use-geolocation";
import { usePlacesAutocomplete } from "@/shared/lib/react/use-places-autocomplete";

import { useManualLocationStore } from "./manual-location-store";

const SEARCH_DEBOUNCE_MS = 250;
const MIN_QUERY_LENGTH = 2;

/**
 * Encapsulates all behaviour of the location picker: open/close state,
 * debounced autocomplete, place selection and on-demand geolocation.
 */
export const useLocationPicker = () => {
  const setLocation = useManualLocationStore((state) => state.setLocation);
  // This fork's useGeolocation always requests on mount (no on-demand mode),
  // so "Use current location" below reverse-geocodes whatever coords it
  // already resolved instead of triggering a fresh request.
  const geolocation = useGeolocation();

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [locateError, setLocateError] = useState(false);

  const suggestionsQuery = usePlacesAutocomplete(debouncedQuery);
  const suggestions = suggestionsQuery.data ?? [];
  const hasQuery = debouncedQuery.trim().length >= MIN_QUERY_LENGTH;

  const debouncedSetQuery = useMemo(
    () => debounce(setDebouncedQuery, SEARCH_DEBOUNCE_MS),
    [],
  );

  const close = () => {
    setIsOpen(false);
    setQuery("");
    setDebouncedQuery("");
    setLocateError(false);
  };

  const open = () => setIsOpen(true);

  const handleOpenChange = (next: boolean) => {
    if (!next) close();
  };

  const handleInputChange = (value: string) => {
    setQuery(value);
    debouncedSetQuery(value.trim());
  };

  const handleSelect = async (prediction: PlacePrediction | null) => {
    if (!prediction) return;
    const resolved = await geocodeByPlaceId(prediction.placeId);
    // Keep the prediction's compact label — it matches what the user clicked.
    if (resolved) setLocation({ ...resolved, label: prediction.label });
    close();
  };

  const handleDetect = async () => {
    setLocateError(false);
    if (!geolocation.coords) {
      setLocateError(true);
      return;
    }
    try {
      setLocation(await reverseGeocode(geolocation.coords));
      close();
    } catch {
      setLocateError(true);
    }
  };

  return {
    isOpen,
    query,
    suggestions,
    hasQuery,
    isLoadingSuggestions: suggestionsQuery.isLoading,
    isErrorSuggestions: suggestionsQuery.isError,
    isLocating: geolocation.isLoading,
    locateError,
    isLocationBlocked: geolocation.permission === "denied",
    open,
    handleOpenChange,
    handleInputChange,
    handleSelect,
    handleDetect,
  };
};
