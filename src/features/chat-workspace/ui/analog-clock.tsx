import { useEffect, useState } from "react";

import { cn } from "@/shared/lib/css";

export type AnalogClockProps = React.ComponentProps<"div"> & {
  /** Diameter of the dial in pixels. Defaults to 32 to match the Figma pill. */
  size?: number;
  /**
   * UTC offset (seconds) of the location to display. When provided, the clock
   * shows wall-clock time at that place; otherwise it uses the browser's time.
   */
  utcOffsetSeconds?: number;
};

type Angles = { hour: number; minute: number };

const SECONDS_PER_DAY = 24 * 60 * 60;

const computeAngles = (utcOffsetSeconds?: number): Angles => {
  let hour: number;
  let minute: number;
  let second: number;

  if (typeof utcOffsetSeconds === "number") {
    // Shift epoch seconds by the target offset, then read the wall clock via
    // modular arithmetic so the browser's own timezone never interferes.
    const targetSeconds = Math.floor(Date.now() / 1000) + utcOffsetSeconds;
    const secondsOfDay =
      ((targetSeconds % SECONDS_PER_DAY) + SECONDS_PER_DAY) % SECONDS_PER_DAY;
    hour = Math.floor(secondsOfDay / 3600) % 12;
    minute = Math.floor((secondsOfDay % 3600) / 60);
    second = secondsOfDay % 60;
  } else {
    const now = new Date();
    hour = now.getHours() % 12;
    minute = now.getMinutes();
    second = now.getSeconds();
  }

  return {
    hour: hour * 30 + minute * 0.5,
    // Subsecond drift keeps the minute hand visibly smooth on each tick.
    minute: minute * 6 + second * 0.1,
  };
};

export const AnalogClock = ({
  size = 32,
  className,
  utcOffsetSeconds,
  ...props
}: AnalogClockProps) => {
  const [angles, setAngles] = useState<Angles>(() =>
    computeAngles(utcOffsetSeconds),
  );

  useEffect(() => {
    const tick = () => setAngles(computeAngles(utcOffsetSeconds));
    tick();
    const intervalId = window.setInterval(tick, 1000);
    return () => window.clearInterval(intervalId);
  }, [utcOffsetSeconds]);

  // The outer dial ring is provided by the wrapping Badge border, so the clock
  // SVG only renders the hands and the central pivot to match Figma.
  const cx = 50;
  const cy = 50;
  const hourHandLength = 22;
  const minuteHandLength = 32;

  return (
    <div
      role="img"
      aria-label="Current time"
      className={cn("relative", className)}
      style={{ width: size, height: size }}
      {...props}
    >
      <svg
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full"
      >
        <line
          x1={cx}
          y1={cy}
          x2={cx}
          y2={cy - hourHandLength}
          className="stroke-typography-primary"
          strokeWidth={4}
          strokeLinecap="round"
          transform={`rotate(${angles.hour} ${cx} ${cy})`}
        />
        <line
          x1={cx}
          y1={cy}
          x2={cx}
          y2={cy - minuteHandLength}
          className="stroke-typography-primary"
          strokeWidth={3}
          strokeLinecap="round"
          transform={`rotate(${angles.minute} ${cx} ${cy})`}
        />
        <circle cx={cx} cy={cy} r={3} className="fill-typography-primary" />
      </svg>
    </div>
  );
};
