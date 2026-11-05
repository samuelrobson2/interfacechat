import { CONFIG } from "@/shared/model/config";

export type PlacePrediction = {
  placeId: string;
  /** Primary line, e.g. "Mountain View". */
  mainText: string;
  /** Secondary line, e.g. "CA, USA". */
  secondaryText: string;
  /** Compact label for display, e.g. "Mountain View, CA". */
  label: string;
};

type AutocompleteText = { text?: string };

type PlacePredictionResponse = {
  placeId?: string;
  text?: AutocompleteText;
  structuredFormat?: {
    mainText?: AutocompleteText;
    secondaryText?: AutocompleteText;
  };
};

type AutocompleteResponse = {
  suggestions?: Array<{ placePrediction?: PlacePredictionResponse }>;
};

const AUTOCOMPLETE_URL = "https://places.googleapis.com/v1/places:autocomplete";

// Field mask keeps the response (and billing) minimal — only what we render.
const FIELD_MASK =
  "suggestions.placePrediction.placeId," +
  "suggestions.placePrediction.text.text," +
  "suggestions.placePrediction.structuredFormat.mainText.text," +
  "suggestions.placePrediction.structuredFormat.secondaryText.text";

// Drops the trailing country segment so "CA, USA" renders as "CA".
const compactLabel = (mainText: string, secondaryText: string): string => {
  if (!secondaryText) return mainText;
  const parts = secondaryText.split(",").map((part) => part.trim());
  const region = parts.length > 1 ? parts[0] : null;
  return region ? `${mainText}, ${region}` : mainText;
};

export const fetchPlacePredictions = async (
  input: string,
  signal: AbortSignal,
): Promise<PlacePrediction[]> => {
  const response = await fetch(AUTOCOMPLETE_URL, {
    method: "POST",
    signal,
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": CONFIG.GOOGLE_MAPS_API_KEY,
      "X-Goog-FieldMask": FIELD_MASK,
    },
    // Restrict to cities — the widget tracks a user's location, not businesses.
    body: JSON.stringify({
      input,
      includedPrimaryTypes: ["(cities)"],
      languageCode: "en",
    }),
  });
  if (!response.ok) {
    throw new Error(`Places autocomplete failed: ${response.status}`);
  }

  const data = (await response.json()) as AutocompleteResponse;
  return (data.suggestions ?? [])
    .map((suggestion) => suggestion.placePrediction)
    .filter((prediction): prediction is PlacePredictionResponse =>
      Boolean(prediction?.placeId),
    )
    .map((prediction) => {
      const mainText =
        prediction.structuredFormat?.mainText?.text ??
        prediction.text?.text ??
        "";
      const secondaryText =
        prediction.structuredFormat?.secondaryText?.text ?? "";
      return {
        placeId: prediction.placeId as string,
        mainText,
        secondaryText,
        label: compactLabel(mainText, secondaryText),
      };
    });
};
