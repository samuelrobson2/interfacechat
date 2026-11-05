import { WeatherSunIcon } from "@/shared/assets/icons/general/WeatherSun";
import { ChevronBottomIcon } from "@/shared/assets/icons/outlined/ChevronBottom";
import { DEV_AUTH_BYPASS } from "@/shared/model/dev-auth-bypass";
import { useWeather } from "@/shared/lib/react/use-weather";
import { Badge } from "@/shared/ui/kit/badge";

import { getOutfitHint } from "../lib/outfit-hints";
import {
  formatTemperature,
  getTemperatureUnit,
} from "../lib/temperature-units";
import { useActiveLocation } from "../model/use-active-location";
import { AnalogClock } from "../ui/analog-clock";
import { ChatLocationPicker } from "../ui/chat-location-picker";

const PILL_CLASSES = "h-8 px-3 py-1.5 gap-1.5";

// DEV-ONLY placeholder content. Static, made-up values — not real geolocation
// or weather — shown when DEV_AUTH_BYPASS is on so the bar is populated locally.
const PLACEHOLDER = {
  locationLabel: "Cloud City",
  temperature: "72° F",
  caption: "Great day to ship a model",
  // A fixed, made-up offset so the clock isn't tied to a real location.
  utcOffsetSeconds: -7 * 3600,
};

function PlaceholderInfoBar() {
  return (
    <div className="fixed top-10 right-12 z-40 flex items-center gap-2">
      <Badge size="sm" className={PILL_CLASSES}>
        {PLACEHOLDER.locationLabel}
        <ChevronBottomIcon svgClasses="size-3" />
      </Badge>
      <Badge size="sm" className={PILL_CLASSES}>
        <WeatherSunIcon svgClasses="size-3" />
        {PLACEHOLDER.temperature}
      </Badge>
      <Badge size="sm" className={PILL_CLASSES}>
        {PLACEHOLDER.caption}
      </Badge>
      <Badge size="icon" aria-hidden>
        <AnalogClock size={32} utcOffsetSeconds={PLACEHOLDER.utcOffsetSeconds} />
      </Badge>
    </div>
  );
}

function LiveInfoBar() {
  const { location } = useActiveLocation();
  const coords = location?.coords ?? null;
  const weatherQuery = useWeather(coords);

  const weather = weatherQuery.data;
  const hasWeather = !!weather && !weatherQuery.isError;
  const locationLabel = location?.label ?? "";
  // Unit follows the active location's country (profile country on fallback).
  const temperatureUnit = getTemperatureUnit(location?.countryCode);

  return (
    <div className="fixed top-10 right-12 z-40 flex items-center gap-2">
      {hasWeather && (
        <>
          <ChatLocationPicker label={locationLabel} pillClassName={PILL_CLASSES} />
          <Badge size="sm" className={PILL_CLASSES}>
            <WeatherSunIcon svgClasses="size-3" />
            {formatTemperature(weather, temperatureUnit)}
          </Badge>
          <Badge size="sm" className={PILL_CLASSES}>
            {getOutfitHint(weather.temperatureC, weather.weatherCode)}
          </Badge>
        </>
      )}
      <Badge size="icon" aria-hidden>
        <AnalogClock size={32} utcOffsetSeconds={weather?.utcOffsetSeconds} />
      </Badge>
    </div>
  );
}

export const ChatDashboardInfoSidebar = () => {
  // In dev (no backend / geolocation) render static placeholders instead of
  // running the real geolocation + weather hooks.
  if (DEV_AUTH_BYPASS) return <PlaceholderInfoBar />;
  return <LiveInfoBar />;
};
