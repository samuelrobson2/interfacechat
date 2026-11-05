import { CONFIG } from "@/shared/model/config";

import type { GeolocationCoords } from "@/shared/lib/react/use-geolocation";

export type WeatherReading = {
  /** Temperature in Fahrenheit. */
  temperatureF: number;
  /** Temperature in Celsius (used for outfit hints). */
  temperatureC: number;
  /** WMO-style bucket code: 0=clear, 61=rain, 71=snow, 95=thunderstorm. */
  weatherCode: number;
  /** UTC offset (seconds) of the location, so the clock shows local time. */
  utcOffsetSeconds?: number;
};

type GoogleTemperature = { degrees?: number; unit?: string };

type GoogleCurrentConditions = {
  timeZone?: { id?: string };
  weatherCondition?: { type?: string };
  temperature?: GoogleTemperature;
};

const WEATHER_URL =
  "https://weather.googleapis.com/v1/currentConditions:lookup";

// Maps Google's weatherCondition.type enum onto the three precipitation
// buckets the outfit hints care about (anything else is treated as clear).
const conditionTypeToWeatherCode = (type: string | undefined): number => {
  if (!type) return 0;
  if (type.includes("THUNDER")) return 95;
  if (type.includes("SNOW") || type.includes("HAIL")) return 71;
  if (type.includes("RAIN") || type.includes("SHOWER")) return 61;
  return 0;
};

// Derives the UTC offset (seconds) for an IANA timezone id by diffing the
// same instant formatted in the target zone vs UTC.
const getUtcOffsetSeconds = (timeZoneId: string): number | undefined => {
  try {
    const now = new Date();
    const tzTime = new Date(
      now.toLocaleString("en-US", { timeZone: timeZoneId }),
    );
    const utcTime = new Date(now.toLocaleString("en-US", { timeZone: "UTC" }));
    return Math.round((tzTime.getTime() - utcTime.getTime()) / 1000);
  } catch {
    return undefined;
  }
};

export const fetchCurrentConditions = async (
  coords: GeolocationCoords,
  signal: AbortSignal,
): Promise<WeatherReading> => {
  const url = new URL(WEATHER_URL);
  url.searchParams.set("key", CONFIG.GOOGLE_MAPS_API_KEY);
  url.searchParams.set("location.latitude", coords.lat.toString());
  url.searchParams.set("location.longitude", coords.lon.toString());
  // Request Celsius; Fahrenheit is derived locally to avoid a second call.
  url.searchParams.set("unitsSystem", "METRIC");

  const response = await fetch(url.toString(), {
    signal,
    headers: { Accept: "application/json" },
  });
  if (!response.ok) {
    throw new Error(`Weather request failed: ${response.status}`);
  }

  const data = (await response.json()) as GoogleCurrentConditions;
  const temperatureC = data.temperature?.degrees;
  if (typeof temperatureC !== "number") {
    throw new Error("Weather response missing temperature");
  }

  const timeZoneId = data.timeZone?.id;
  return {
    temperatureC,
    temperatureF: temperatureC * (9 / 5) + 32,
    weatherCode: conditionTypeToWeatherCode(data.weatherCondition?.type),
    utcOffsetSeconds: timeZoneId ? getUtcOffsetSeconds(timeZoneId) : undefined,
  };
};
