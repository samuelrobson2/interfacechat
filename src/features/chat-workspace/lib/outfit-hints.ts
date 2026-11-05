// WMO weather-code ranges (Open-Meteo) — drizzle, rain, freezing rain, rain showers.
const RAIN_CODES = new Set<number>([
  51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82,
]);
// WMO snowfall / snow grains / snow showers.
const SNOW_CODES = new Set<number>([71, 73, 75, 77, 85, 86]);
// WMO thunderstorm (with/without hail).
const THUNDER_CODES = new Set<number>([95, 96, 99]);

const baseHintByCelsius = (temperatureC: number): string => {
  if (temperatureC < 0) return "Bundle up — winter coat";
  if (temperatureC < 10) return "Warm jacket recommended";
  if (temperatureC < 18) return "Light jacket or sweater";
  if (temperatureC < 25) return "A jacket should do";
  return "It's hot — stay cool";
};

export const getOutfitHint = (
  temperatureC: number,
  weatherCode: number,
): string => {
  const base = baseHintByCelsius(temperatureC);

  if (THUNDER_CODES.has(weatherCode)) {
    return `${base} — thunderstorm outside`;
  }
  if (SNOW_CODES.has(weatherCode)) {
    return "Bundle up — snow outside";
  }
  if (RAIN_CODES.has(weatherCode)) {
    return `${base} and grab an umbrella`;
  }
  return base;
};
