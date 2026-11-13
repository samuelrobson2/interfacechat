import { useEffect, useRef, useState } from "react";

const TICKER_ANIMATION_MS = 12000;
const easeOutCubic = (progress: number) => 1 - Math.pow(1 - progress, 3);

function getTickerDecimalPlaces(rawValue: string): number {
  const normalizedValue = rawValue.trim();
  const decimalPart = normalizedValue.split(".")[1];
  if (!decimalPart) return 0;
  return decimalPart.length;
}

function formatTickerValue(rawValue: string): string {
  const normalizedValue = rawValue.trim();
  const numericValue = Number(normalizedValue);
  if (!Number.isFinite(numericValue)) return rawValue;
  return numericValue.toFixed(getTickerDecimalPlaces(normalizedValue));
}

function getTickerStartValue(rawValue: string) {
  return Number(0).toFixed(getTickerDecimalPlaces(rawValue));
}

/** What to show the moment the inputs change, before any animation frame. */
function getImmediateDisplayValue(
  value: string,
  enabled: boolean,
  hasInteracted: boolean,
): string {
  if (!enabled || hasInteracted) return value;
  const normalizedValue = value.trim();
  if (normalizedValue === "") return "";
  if (!Number.isFinite(Number(normalizedValue))) return normalizedValue;
  return getTickerStartValue(normalizedValue);
}

export function useNumericTicker({
  value,
  enabled,
}: {
  value: string;
  enabled: boolean;
}) {
  const [hasInteracted, setHasInteracted] = useState(false);
  const [displayValue, setDisplayValue] = useState(() =>
    getImmediateDisplayValue(value, enabled, false),
  );
  const rafIdRef = useRef(0);

  // Snap to the start (or final) value as soon as the inputs change — adjusted
  // during render; the animation frames below count up from there.
  const [source, setSource] = useState({ value, enabled });
  if (source.value !== value || source.enabled !== enabled) {
    setSource({ value, enabled });
    setDisplayValue(getImmediateDisplayValue(value, enabled, hasInteracted));
  }

  useEffect(() => {
    cancelAnimationFrame(rafIdRef.current);
    rafIdRef.current = 0;

    if (!enabled || hasInteracted) return;

    const normalizedValue = value.trim();
    if (normalizedValue === "") return;

    const target = Number(normalizedValue);
    if (!Number.isFinite(target)) return;

    const decimalPlaces = getTickerDecimalPlaces(normalizedValue);
    const startedAt = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - startedAt) / TICKER_ANIMATION_MS, 1);
      const eased = easeOutCubic(progress);
      const nextValue = target * eased;
      setDisplayValue(nextValue.toFixed(decimalPlaces));

      if (progress < 1) {
        rafIdRef.current = requestAnimationFrame(tick);
        return;
      }

      setDisplayValue(formatTickerValue(normalizedValue));
      rafIdRef.current = 0;
    };

    rafIdRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = 0;
    };
  }, [enabled, value, hasInteracted]);

  const handleUserInteraction = () => {
    setHasInteracted(true);
    cancelAnimationFrame(rafIdRef.current);
    rafIdRef.current = 0;
    setDisplayValue(value);
  };

  return {
    displayValue,
    handleUserInteraction,
  };
}
