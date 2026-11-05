import { useMemo } from "react";

import { cn } from "@/shared/lib/css";
import { WeatherSunIcon } from "@/shared/assets/icons/general/WeatherSun";
import { useWeather } from "@/shared/lib/react/use-weather";
import { Badge } from "@/shared/ui/kit/badge";
import { InteractiveBadge } from "@/shared/ui/kit/interactive-badge";
import { Skeleton } from "@/shared/ui/kit/skeleton";

import { getGreetingsHintText } from "../lib/greetings-hint";
import {
  formatTemperature,
  getTemperatureUnit,
} from "../lib/temperature-units";
import { useManualLocationStore } from "../model/manual-location-store";
import { useActiveLocation } from "../model/use-active-location";
import { AnalogClock } from "../ui/analog-clock";
import { LocationPicker } from "../ui/location-picker";

const PILL_CLASSES = "h-8 px-3 py-1.5 gap-1.5";
const SKELETON_PILL_WIDTHS = ["w-28", "w-16", "w-44"];

export const LocationWeatherWidget = () => {
  const { location, isResolving } = useActiveLocation();
  const coords = location?.coords ?? null;
  const weatherQuery = useWeather(coords);

  const weather = weatherQuery.data;
  const hasWeather = !!weather && !weatherQuery.isError;
  const locationLabel = location?.label ?? "";

  const defaultUnit = getTemperatureUnit(location?.countryCode);

  // Persisted user choice wins; otherwise fall back to the location default.
  const unitOverride = useManualLocationStore((state) => state.temperatureUnit);
  const setTemperatureUnit = useManualLocationStore(
    (state) => state.setTemperatureUnit,
  );
  const temperatureUnit = unitOverride ?? defaultUnit;

  const handleToggleUnit = () => {
    setTemperatureUnit(temperatureUnit === "C" ? "F" : "C");
  };

  const isLoading =
    !hasWeather && (isResolving || (!!coords && weatherQuery.isLoading));

  // Pick the pill text once per weather change so it doesn't flip on every render.
  const weatherPillText = useMemo(
    () =>
      weather
        ? getGreetingsHintText(weather.temperatureC, weather.weatherCode)
        : "",
    [weather],
  );

  return (
    <div className="fixed top-12 right-12 z-40 flex items-center gap-2">
      {isLoading &&
        SKELETON_PILL_WIDTHS.map((width) => (
          <Skeleton key={width} className={cn("h-8 rounded-full", width)} />
        ))}

      {hasWeather && (
        <>
          <LocationPicker label={locationLabel} pillClassName={PILL_CLASSES} />
          <InteractiveBadge
            size="sm"
            className={PILL_CLASSES}
            onClick={handleToggleUnit}
            aria-label={`Switch temperature unit, currently in degrees ${temperatureUnit === "C" ? "Celsius" : "Fahrenheit"}`}
          >
            <WeatherSunIcon svgClasses="size-3" />
            {formatTemperature(weather, temperatureUnit)}
          </InteractiveBadge>
          <Badge size="sm" className={PILL_CLASSES}>
            {weatherPillText}
          </Badge>
        </>
      )}

      <Badge size="icon" aria-hidden>
        <AnalogClock size={32} utcOffsetSeconds={weather?.utcOffsetSeconds} />
      </Badge>
    </div>
  );
};
