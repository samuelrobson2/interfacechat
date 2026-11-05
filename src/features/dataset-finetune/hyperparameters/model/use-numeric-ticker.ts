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

export function useNumericTicker({
  value,
  enabled,
}: {
  value: string;
  enabled: boolean;
}) {
  const [displayValue, setDisplayValue] = useState(value);
  const hasInteractedRef = useRef(false);
  const rafIdRef = useRef(0);

  useEffect(() => {
    cancelAnimationFrame(rafIdRef.current);
    rafIdRef.current = 0;

    if (!enabled || hasInteractedRef.current) {
      setDisplayValue(value);
      return;
    }

    const normalizedValue = value.trim();
    if (normalizedValue === "") {
      setDisplayValue("");
      return;
    }

    const target = Number(normalizedValue);
    if (!Number.isFinite(target)) {
      setDisplayValue(normalizedValue);
      return;
    }

    const decimalPlaces = getTickerDecimalPlaces(normalizedValue);
    setDisplayValue(getTickerStartValue(normalizedValue));

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
  }, [enabled, value]);

  const handleUserInteraction = () => {
    hasInteractedRef.current = true;
    cancelAnimationFrame(rafIdRef.current);
    rafIdRef.current = 0;
    setDisplayValue(value);
  };

  return {
    displayValue,
    handleUserInteraction,
  };
}
