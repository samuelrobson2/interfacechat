import {
  useCallback,
  useEffectEvent,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

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

  const getTimeLeft = useCallback((endTime: Date) => {
    return Math.max(0, Math.ceil((endTime.getTime() - Date.now()) / 1000));
  }, []);

  const clearIntervalId = () => {
    if (intervalId.current) {
      clearInterval(intervalId.current);
      intervalId.current = null;
    }
  };

  const clear = useEffectEvent(() => {
    setTimeLeft(null);
    setIsStarted(false);
    localStorage.removeItem(storageKey);

    clearIntervalId();
  });

  const internalStart = useEffectEvent((endTime: Date) => {
    clear();

    localStorage.setItem(storageKey, endTime.getTime().toString());
    setTimeLeft(getTimeLeft(endTime));
    setIsStarted(true);
    onStart?.();

    intervalId.current = setInterval(() => {
      const newRemaining = getTimeLeft(endTime);
      setTimeLeft(newRemaining);

      if (newRemaining === 0) clear();
    }, 250);
  });

  const start = useEffectEvent(() => {
    const endTime = new Date(Date.now() + duration * 1000);

    internalStart(endTime);
  });

  useLayoutEffect(() => {
    const endTime = localStorage.getItem(storageKey);

    if (!endTime) {
      if (!instantStart) return;
      start();
      return;
    }

    const endTimeDate = new Date(parseInt(endTime));
    if (endTimeDate > new Date()) {
      internalStart(endTimeDate);
    } else {
      clear();
    }

    return () => clearIntervalId();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instantStart, storageKey]);

  const isReady = isStarted && timeLeft !== null && timeLeft === 0;

  return {
    timeLeft,
    isStarted,
    isReady,
    start,
    clear,
  };
};
