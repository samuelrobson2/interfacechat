import type { GeolocationCoords } from "@/shared/lib/react/use-geolocation";

import { loadGoogleMaps } from "./maps-loader";

export type ResolvedLocation = {
  coords: GeolocationCoords;
  /** Human-readable label, e.g. "Mountain View, CA". */
  label: string;
  /** ISO 3166-1 alpha-2 code, drives the temperature unit (F/C). */
  countryCode: string | null;
};

const findComponent = (
  components: google.maps.GeocoderAddressComponent[] | undefined,
  type: string,
): google.maps.GeocoderAddressComponent | undefined =>
  components?.find((component) => component.types.includes(type));

const getCountryCode = (
  components: google.maps.GeocoderAddressComponent[] | undefined,
): string | null => findComponent(components, "country")?.short_name ?? null;

// Builds a "City, Region" label from address components, falling back to the
// formatted address when locality data is unavailable (e.g. remote coords).
const buildLocalityLabel = (result: google.maps.GeocoderResult): string => {
  const components = result.address_components;
  const city =
    findComponent(components, "locality")?.long_name ||
    findComponent(components, "postal_town")?.long_name ||
    findComponent(components, "sublocality")?.long_name ||
    findComponent(components, "administrative_area_level_2")?.long_name;
  const region = findComponent(
    components,
    "administrative_area_level_1",
  )?.short_name;

  if (city && region) return `${city}, ${region}`;
  if (city) return city;
  return result.formatted_address ?? "";
};

const toResolvedLocation = (
  result: google.maps.GeocoderResult,
  coordsOverride?: GeolocationCoords,
  fallbackLabel?: string,
): ResolvedLocation | null => {
  const location = result.geometry?.location;
  const coords =
    coordsOverride ??
    (location ? { lat: location.lat(), lon: location.lng() } : null);
  if (!coords) return null;
  return {
    coords,
    label: buildLocalityLabel(result) || fallbackLabel || "",
    countryCode: getCountryCode(result.address_components),
  };
};

// Geocoding goes through the JS SDK so a referrer-restricted key works.
const runGeocode = async (
  request: google.maps.GeocoderRequest,
): Promise<google.maps.GeocoderResult | null> => {
  await loadGoogleMaps();
  const geocoder = new google.maps.Geocoder();
  try {
    const { results } = await geocoder.geocode(request);
    return results[0] ?? null;
  } catch {
    // ZERO_RESULTS or a transient error — treat as "no match".
    return null;
  }
};

/** Resolves a place prediction (by place id) to coordinates + label. */
export const geocodeByPlaceId = async (
  placeId: string,
): Promise<ResolvedLocation | null> => {
  const result = await runGeocode({ placeId });
  return result ? toResolvedLocation(result) : null;
};

/** Resolves raw GPS coordinates to a city label + country code. */
export const reverseGeocode = async (
  coords: GeolocationCoords,
): Promise<ResolvedLocation> => {
  const result = await runGeocode({
    location: { lat: coords.lat, lng: coords.lon },
  });
  // Keep the requested coordinates — they are more precise than the matched
  // locality centroid the geocoder returns.
  return (
    (result && toResolvedLocation(result, coords)) ?? {
      coords,
      label: "",
      countryCode: null,
    }
  );
};

/** Resolves a country (profile fallback) to a representative point + label. */
export const geocodeCountry = async (country: {
  code?: string | null;
  name?: string | null;
}): Promise<ResolvedLocation | null> => {
  const query = country.name || country.code;
  if (!query) return null;
  const result = await runGeocode({ address: query });
  if (!result) return null;
  const resolved = toResolvedLocation(result, undefined, country.name ?? undefined);
  if (!resolved) return null;
  // Prefer the known profile country code/name over the geocoder's guess.
  return {
    ...resolved,
    label: country.name || resolved.label,
    countryCode: country.code ?? resolved.countryCode,
  };
};
