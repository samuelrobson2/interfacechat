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

const getOutfitHint = (temperatureC: number, weatherCode: number): string => {
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

// Four-word greetings shown instead of the weather hint.
const GREETINGS = [
  "Stay wild, moon child.",
  "Today holds pure magic.",
  "Hey there, fellow traveler.",
  "Peace out, cosmic explorer.",
  "Stay groovy, little star.",
  "Clean code, warm coffee.",
  "Dust off old tapes.",
  "Typewriters capture pure thoughts.",
  "Craft beer, sharp syntax.",
  "Support your local barista.",
  "True taste takes time.",
  "Stay humble, iterate fast.",
  "Question every default assumption.",
  "Seek depth, not surface.",
  "Chaos breeds beautiful art.",
  "Breathe in, breathe out.",
  "Less noise, more signal.",
  "Explore your own backyard.",
  "Defy the cookie cutter.",
  "Keep dancing in dark.",
  "The future is unwritten.",
  "Keep bugs manageable today.",
  "Stay hydrated, keep linting.",
  "Trust the road ahead.",
  "Wisdom hides in wandering.",
  "Cherish the detour today",
  "Pick a fresh flower.",
  "Hug someone you love.",
];

const getRandomGreeting = (): string =>
  GREETINGS[Math.floor(Math.random() * GREETINGS.length)] ?? "Stay wild, moon child.";

// 50/50 chance: either an outfit/weather hint or a random greeting.
export const getGreetingsHintText = (
  temperatureC: number,
  weatherCode: number,
): string =>
  Math.random() < 0.5
    ? getOutfitHint(temperatureC, weatherCode)
    : getRandomGreeting();
