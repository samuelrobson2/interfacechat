import {
  useCallback,
  useEffectEvent,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

const getTimeLeft = (endTime: Date) =>
  Math.max(0, Math.ceil((endTime.getTime() - Date.now()) / 1000));

export const useCountdown = ({
  key,
  duration,
  instantStart = false,
  onStart,
}: {
  key: string;
  duration: number;
  instantStart?: boolean;
  onStart?: () => void;
}) => {
  const storageKey = `countdown_${key}`;
  const intervalId = useRef<ReturnType<typeof setInterval>>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isStarted, setIsStarted] = useState<boolean>(false);

  // Always call the latest `onStart` without making the callbacks below
  // depend on it (callers usually pass an inline function).
  const onStartRef = useRef(onStart);
  useLayoutEffect(() => {
    onStartRef.current = onStart;
  });

  const clearIntervalId = useCallback(() => {
    if (intervalId.current) {
      clearInterval(intervalId.current);
      intervalId.current = null;
    }
  }, []);

  const clear = useCallback(() => {
    setTimeLeft(null);
    setIsStarted(false);
    localStorage.removeItem(storageKey);

    clearIntervalId();
  }, [storageKey, clearIntervalId]);

  const internalStart = useCallback(
    (endTime: Date) => {
      clear();

      localStorage.setItem(storageKey, endTime.getTime().toString());
      setTimeLeft(getTimeLeft(endTime));
      setIsStarted(true);
      onStartRef.current?.();

      intervalId.current = setInterval(() => {
        const newRemaining = getTimeLeft(endTime);
        setTimeLeft(newRemaining);

        if (newRemaining === 0) clear();
      }, 250);
    },
    [clear, storageKey],
  );

  const start = useCallback(() => {
    const endTime = new Date(Date.now() + duration * 1000);

    internalStart(endTime);
  }, [duration, internalStart]);

  /** Resumes a stored countdown; returns whether one was restored or cleared. */
  const restoreFromStorage = useEffectEvent(
    (key: string, startNow: boolean): boolean => {
      const endTime = localStorage.getItem(key);

      if (!endTime) {
        if (startNow) start();
        return false;
      }

      const endTimeDate = new Date(parseInt(endTime));
      if (endTimeDate > new Date()) {
        internalStart(endTimeDate);
      } else {
        clear();
      }
      return true;
    },
  );

  useLayoutEffect(() => {
    if (!restoreFromStorage(storageKey, instantStart)) return;

    return () => clearIntervalId();
  }, [instantStart, storageKey, clearIntervalId]);

  const isReady = isStarted && timeLeft !== null && timeLeft === 0;

  return {
    timeLeft,
    isStarted,
    isReady,
    start,
    clear,
  };
};
