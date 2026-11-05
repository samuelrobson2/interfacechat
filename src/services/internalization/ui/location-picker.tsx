import { LocationIcon } from "@/shared/assets/icons/general/Location";
import { SearchIcon } from "@/shared/assets/icons/general/Search";
import { ChevronBottomIcon } from "@/shared/assets/icons/outlined/ChevronBottom";
import { cn } from "@/shared/lib/css";
import type { PlacePrediction } from "@/shared/lib/google/places";
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

import { useLocationPicker } from "../model/use-location-picker";

type LocationPickerProps = {
  label: string;
  pillClassName?: string;
};

// Resolves the "Use current location" subtitle for the current detection state.
const getDetectSubtitle = (
  isLocating: boolean,
  locateError: boolean,
  isBlocked: boolean,
): string => {
  if (isLocating) return "Detecting…";
  if (isBlocked) return "Blocked — allow access in browser settings";
  if (locateError) return "Couldn’t detect location";
  return "Enable location";
};

export const LocationPicker = ({
  label,
  pillClassName,
}: LocationPickerProps) => {
  const picker = useLocationPicker();

  if (!picker.isOpen) {
    return (
      <Badge
        size="sm"
        role="button"
        tabIndex={0}
        aria-label="Change location"
        onClick={picker.open}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            picker.open();
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

  const hasDetectError = picker.locateError || picker.isLocationBlocked;

  return (
    <Combobox
      open
      items={picker.suggestions}
      // Predictions are filtered server-side; skip Base UI's local filtering.
      filter={null}
      inputValue={picker.query}
      onInputValueChange={picker.handleInputChange}
      onValueChange={picker.handleSelect}
      onOpenChange={picker.handleOpenChange}
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
          "h-8 w-full gap-2 bg-background-primary px-4",
          "rounded-[60px] [--hairline-radius:60px]",
          "[--hairline-color:var(--color-stroke-tertiary)] [--hairline-scale:1]",
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
          "rounded-[12px] border-stroke-tertiary bg-background-primary shadow-md",
        )}
      >
        <button
          type="button"
          aria-label="Use current location"
          aria-busy={picker.isLocating}
          disabled={picker.isLocating}
          onClick={picker.handleDetect}
          className={cn(
            "flex h-10 w-full items-center gap-2 rounded-[8px] px-1.5 py-1 text-left",
            "transition-colors hover:bg-gray-6 disabled:opacity-60",
          )}
        >
          <LocationIcon
            svgClasses={cn(
              "size-5 shrink-0",
              picker.isLocating && "animate-pulse",
            )}
            pathClasses={hasDetectError ? "stroke-red-5" : "stroke-icon-primary"}
          />
          <span className="flex flex-col gap-0.5">
            <Text variant="caption" color="primary">
              Use current location
            </Text>
            <Text variant="small" color={hasDetectError ? "error" : "secondary"}>
              {getDetectSubtitle(
                picker.isLocating,
                picker.locateError,
                picker.isLocationBlocked,
              )}
            </Text>
          </span>
        </button>

        {picker.hasQuery && picker.isLoadingSuggestions && (
          <Text variant="label" color="secondary" className="px-1.5 py-1">
            Searching…
          </Text>
        )}

        {picker.hasQuery && !picker.isLoadingSuggestions && (
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
              {picker.isErrorSuggestions
                ? "Couldn’t load locations"
                : "No matches found"}
            </ComboboxEmpty>
          </>
        )}
      </ComboboxContent>
    </Combobox>
  );
};
