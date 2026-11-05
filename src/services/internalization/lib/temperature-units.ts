import type { WeatherSnapshot } from "@/shared/lib/react/use-weather";

export type TemperatureUnit = "F" | "C";

// ISO 3166-1 alpha-2 codes of countries/territories where Fahrenheit is used
// for everyday weather (exclusively or alongside Celsius). Sources:
// worldpopulationreview.com (2026) and en.wikipedia.org/wiki/Fahrenheit.
// Everything else falls back to Celsius (the global default).
const FAHRENHEIT_COUNTRY_CODES = new Set<string>([
  "US", // United States
  "LR", // Liberia
  "KY", // Cayman Islands
  "PR", // Puerto Rico
  "GU", // Guam
  "VI", // U.S. Virgin Islands
  "AS", // American Samoa
  "MP", // Northern Mariana Islands
  "FM", // Micronesia (Federated States)
  "MH", // Marshall Islands
  "PW", // Palau
  "BS", // Bahamas
  "BZ", // Belize
  "AG", // Antigua and Barbuda
  "KN", // Saint Kitts and Nevis
  "VG", // British Virgin Islands
  "MS", // Montserrat
  "AI", // Anguilla
  "BM", // Bermuda
  "TC", // Turks and Caicos Islands
]);

/** Resolves the preferred temperature unit from the user's country code. */
export const getTemperatureUnit = (
  countryCode?: string | null,
): TemperatureUnit =>
  countryCode && FAHRENHEIT_COUNTRY_CODES.has(countryCode.toUpperCase())
    ? "F"
    : "C";

/** Formats a weather reading using the given unit, e.g. "72° F" / "22° C". */
export const formatTemperature = (
  weather: WeatherSnapshot,
  unit: TemperatureUnit,
): string => {
  const value = unit === "F" ? weather.temperatureF : weather.temperatureC;
  return `${Math.round(value)}° ${unit}`;
};
