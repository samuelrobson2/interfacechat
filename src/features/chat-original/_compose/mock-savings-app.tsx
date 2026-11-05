import { useMemo, useState } from "react";

import { cn } from "@/shared/lib/css";
import { SliderRow } from "@/shared/ui/kit/slider";
import { Text } from "@/shared/ui/kit/text";

// DEV-ONLY mock interactive "app" — large enough that it lives in the side
// panel rather than inline. A savings projection calculator: drag the inputs
// and the summary + chart recompute live.

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

type Point = { year: number; balance: number; contributed: number };

function project(
  initial: number,
  monthly: number,
  ratePct: number,
  years: number,
): Point[] {
  const monthlyRate = ratePct / 100 / 12;
  let balance = initial;
  let contributed = initial;
  const points: Point[] = [{ year: 0, balance, contributed }];
  for (let year = 1; year <= years; year++) {
    for (let month = 0; month < 12; month++) {
      balance = balance * (1 + monthlyRate) + monthly;
      contributed += monthly;
    }
    points.push({ year, balance, contributed });
  }
  return points;
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1 rounded-[12px] p-3",
        accent ? "bg-blue-1" : "bg-gray-1",
      )}
    >
      <Text variant="caption" color="secondary">
        {label}
      </Text>
      <Text
        variant="subtitle"
        className={cn("tabular-nums", accent && "text-blue-5")}
      >
        {value}
      </Text>
    </div>
  );
}

function GrowthChart({
  points,
  max,
  years,
}: {
  points: Point[];
  max: number;
  years: number;
}) {
  const height = 180;
  return (
    <div
      className={cn(
        "rounded-[16px] bg-background-primary p-5",
        "hairline [--hairline-color:var(--color-gray-3)] [--hairline-radius:16px] [--hairline-opacity:0.3]",
      )}
    >
      <div className="mb-3 flex items-center gap-4">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-[2px] bg-blue-4" />
          <Text variant="caption" color="secondary">
            Contributions
          </Text>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-[2px] bg-[#7fbfbf]" />
          <Text variant="caption" color="secondary">
            Interest
          </Text>
        </span>
      </div>

      <div
        className="flex items-end gap-[3px] border-b border-gray-2"
        style={{ height }}
      >
        {points.slice(1).map((point) => {
          const total = (point.balance / max) * height;
          const base = (point.contributed / max) * height;
          return (
            <div
              key={point.year}
              className="flex flex-1 flex-col justify-end"
              title={`Year ${point.year}: ${formatCurrency(point.balance)}`}
            >
              <span
                className="rounded-t-[2px] bg-[#7fbfbf]"
                style={{ height: Math.max(0, total - base) }}
              />
              <span className="bg-blue-4" style={{ height: base }} />
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex justify-between">
        <Text variant="caption" color="secondary">
          Year 1
        </Text>
        <Text variant="caption" color="secondary">
          Year {years}
        </Text>
      </div>
    </div>
  );
}

export function SavingsApp() {
  const [initial, setInitial] = useState(5000);
  const [monthly, setMonthly] = useState(300);
  const [rate, setRate] = useState(6);
  const [years, setYears] = useState(20);

  const points = useMemo(
    () => project(initial, monthly, rate, years),
    [initial, monthly, rate, years],
  );
  const last = points[points.length - 1]!;
  const interest = last.balance - last.contributed;
  const max = last.balance || 1;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-3 gap-3">
        <Stat label="Future balance" value={formatCurrency(last.balance)} accent />
        <Stat label="You put in" value={formatCurrency(last.contributed)} />
        <Stat label="Interest earned" value={formatCurrency(interest)} />
      </div>

      <GrowthChart points={points} max={max} years={years} />

      <div
        className={cn(
          "flex flex-col gap-4 rounded-[16px] p-5",
          "hairline [--hairline-color:var(--color-gray-3)] [--hairline-radius:16px] [--hairline-opacity:0.3]",
        )}
      >
        <SliderRow
          label="Initial deposit"
          value={[initial]}
          onValueChange={([v]) => setInitial(v ?? initial)}
          min={0}
          max={50000}
          step={500}
        />
        <SliderRow
          label="Monthly contribution"
          value={[monthly]}
          onValueChange={([v]) => setMonthly(v ?? monthly)}
          min={0}
          max={2000}
          step={50}
        />
        <SliderRow
          label="Annual return (%)"
          value={[rate]}
          onValueChange={([v]) => setRate(v ?? rate)}
          min={0}
          max={12}
          step={0.5}
        />
        <SliderRow
          label="Years"
          value={[years]}
          onValueChange={([v]) => setYears(v ?? years)}
          min={1}
          max={40}
          step={1}
        />
      </div>
    </div>
  );
}
