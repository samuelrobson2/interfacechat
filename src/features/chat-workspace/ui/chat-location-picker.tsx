import { useMemo, useState } from "react";

import { LocationIcon } from "@/shared/assets/icons/general/Location";
import { SearchIcon } from "@/shared/assets/icons/general/Search";
import { ChevronBottomIcon } from "@/shared/assets/icons/outlined/ChevronBottom";
import { cn } from "@/shared/lib/css";
import {
  geocodeByPlaceId,
  reverseGeocode,
} from "@/shared/lib/google/geocoding";
import type { PlacePrediction } from "@/shared/lib/google/places";
import { debounce } from "@/shared/lib/js";
import { usePlacesAutocomplete } from "@/shared/lib/react/use-places-autocomplete";
import { Badge } from "@/shared/ui/kit/badge";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/shared/ui/kit/combobox";
import { Text, textVariants } from "@/shared/ui/kit/text";

import { useManualLocationStore } from "../model/manual-location-store";

const SEARCH_DEBOUNCE_MS = 250;
const MIN_QUERY_LENGTH = 2;

const POSITION_OPTIONS: PositionOptions = {
  enableHighAccuracy: false,
  maximumAge: 5 * 60 * 1000,
  timeout: 10_000,
};

const getCurrentPosition = (): Promise<GeolocationPosition> =>
  new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      reject(new Error("Geolocation is not supported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, POSITION_OPTIONS);
  });

type ChatLocationPickerProps = {
  label: string;
  pillClassName?: string;
};

export const ChatLocationPicker = ({
  label,
  pillClassName,
}: ChatLocationPickerProps) => {
  const setLocation = useManualLocationStore((state) => state.setLocation);

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isLocating, setIsLocating] = useState(false);
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
    setIsLocating(true);
    setLocateError(false);
    try {
      const position = await getCurrentPosition();
      const coords = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
      };
      setLocation(await reverseGeocode(coords));
      close();
    } catch {
      setLocateError(true);
    } finally {
      setIsLocating(false);
    }
  };

  if (!isOpen) {
    return (
      <Badge
        size="sm"
        role="button"
        tabIndex={0}
        aria-label="Change location"
        onClick={() => setIsOpen(true)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setIsOpen(true);
          }
        }}
        className={cn(
          "cursor-pointer transition-colors hover:bg-gray-6",
          pillClassName,
        )}
      >
        {label || "Set location"}
        <ChevronBottomIcon
          svgClasses="size-4 shrink-0"
          pathClasses="stroke-icon-primary"
        />
      </Badge>
    );
  }

  return (
    <Combobox
      open
      items={suggestions}
      // Predictions are filtered server-side; skip Base UI's local filtering.
      filter={null}
      inputValue={query}
      onInputValueChange={handleInputChange}
      onValueChange={handleSelect}
      onOpenChange={(open) => {
        if (!open) close();
      }}
      itemToStringLabel={(item: PlacePrediction) => item?.label ?? ""}
      isItemEqualToValue={(a: PlacePrediction, b: PlacePrediction) =>
        a?.placeId === b?.placeId
      }
    >
      <ComboboxInput
        autoFocus
        showTrigger={false}
        variant="plain"
        fill="outlined"
        shape="rounded"
        placeholder="Search location"
        aria-label="Search location"
        wrapperClassName="w-[240px]"
        className={cn(
          "h-8 w-full gap-2 bg-background-primary px-4 border-0",
          "rounded-[60px] [--hairline-radius:60px]",
          "[--hairline-color:var(--color-stroke-secondary)] has-focus:[--hairline-color:var(--color-stroke-secondary)]",
        )}
        inputClassName={textVariants({ variant: "label", weight: "light" })}
        rightElement={
          <SearchIcon
            svgClasses="size-4 shrink-0"
            pathClasses="stroke-icon-primary"
          />
        }
      />

      <ComboboxContent
        align="start"
        sideOffset={2}
        className={cn(
          "flex w-[240px] flex-col gap-2 p-3",
          "rounded-[12px] border-gray-2 bg-background-primary shadow-md",
        )}
      >
        <button
          type="button"
          aria-label="Use current location"
          aria-busy={isLocating}
          disabled={isLocating}
          onClick={handleDetect}
          className={cn(
            "flex h-10 w-full items-center gap-2 rounded-[8px] px-1.5 py-1 text-left cursor-pointer",
            "transition-colors hover:bg-gray-6 disabled:opacity-60",
          )}
        >
          <LocationIcon
            svgClasses={cn("size-5 shrink-0", isLocating && "animate-pulse")}
            pathClasses={locateError ? "stroke-red-5" : "stroke-icon-primary"}
          />
          <span className="flex flex-col gap-0.5">
            <Text variant="caption" color="primary">
              Use current location
            </Text>
            <Text variant="small" color={locateError ? "error" : "secondary"}>
              {locateError ? "Couldn’t detect location" : "Enable location"}
            </Text>
          </span>
        </button>

        {hasQuery && suggestionsQuery.isLoading && (
          <Text variant="label" color="secondary" className="px-1.5 py-1">
            Searching…
          </Text>
        )}

        {hasQuery && !suggestionsQuery.isLoading && (
          <>
            <ComboboxList className="flex flex-col gap-1">
              {(item: PlacePrediction) => (
                <ComboboxItem
                  key={item.placeId}
                  value={item}
                  className={cn(
                    textVariants({ variant: "label", weight: "light" }),
                    "rounded-[8px] px-1.5 py-1 data-highlighted:bg-gray-6",
                  )}
                >
                  {item.label}
                </ComboboxItem>
              )}
            </ComboboxList>
            <ComboboxEmpty
              className={cn(
                textVariants({ variant: "label", weight: "light" }),
                "justify-start px-1.5 py-1 text-left text-typography-secondary",
              )}
            >
              {suggestionsQuery.isError
                ? "Couldn’t load locations"
                : "No matches found"}
            </ComboboxEmpty>
          </>
        )}
      </ComboboxContent>
    </Combobox>
  );
};
