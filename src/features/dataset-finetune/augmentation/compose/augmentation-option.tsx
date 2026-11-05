import { useMemo, useState } from "react";

import { AiStarIcon } from "@/shared/assets/icons/outlined/AiStar";
import { getNumericValue } from "@/shared/lib/js";
import { Input } from "@/shared/ui/kit/input";
import { Slider } from "@/shared/ui/kit/slider";
import { Text } from "@/shared/ui/kit/text";

export function AugmentationOption({
  title,
  subtitle,
  actionLabel,
  currentCostLabel,
  imageSrc,
  imageAlt,
  value,
  onValueChange,
  maxRows,
  lessThanMarker,
  totalDatasetRows,
}: {
  title: string;
  subtitle: string;
  actionLabel: string;
  currentCostLabel: string;
  imageSrc: string;
  imageAlt: string;
  value: number;
  onValueChange: (value: number) => void;
  maxRows: number;
  lessThanMarker?: number;
  totalDatasetRows: number | null;
}) {
  const [innerValue, setInnerValue] = useState<number>(value);
  const [prevValue, setPrevValue] = useState(value);

  if (value !== prevValue) {
    setPrevValue(value);
    setInnerValue(value);
  }

  const currentValue = useMemo(
    () => Math.max(0, Math.min(innerValue, maxRows)),
    [innerValue, maxRows],
  );
  const lessThanMarkerPosition = useMemo(() => {
    if (lessThanMarker === undefined || maxRows <= 0) return null;
    return Math.max(0, Math.min((lessThanMarker / maxRows) * 100, 100));
  }, [lessThanMarker, maxRows]);

  const handleInputChange = (rawValue: string) => {
    const nextValue = Math.max(0, Math.min(getNumericValue(rawValue), maxRows));
    setInnerValue(nextValue);
    onValueChange(nextValue);
  };

  const handleSliderCommit = (nextValue: number[]) => {
    const committedValue = Math.max(0, Math.min(nextValue[0] ?? 0, maxRows));
    setInnerValue(committedValue);
    onValueChange(committedValue);
  };

  return (
    <div className="flex flex-col gap-9 border border-gray-2 p-10">
      <div className="flex flex-col gap-4 items-center text-center">
        <Text as="h2" variant="h1">
          {title}
        </Text>
        <Text color="secondary" className="text-balance line-clamp-2 ">
          {subtitle}
        </Text>
      </div>

      <div className="grid grid-cols-[84px_minmax(0,1fr)_0.5px_auto] gap-8 items-center">
        <img
          src={imageSrc}
          alt={imageAlt}
          className="h-[84px] w-[84px] object-contain"
        />

        <div className="flex flex-col gap-12">
          <Text variant="title">{actionLabel}</Text>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Text variant="label" color="secondary">
                  Datapoints
                </Text>
              </div>

              <Input
                variant="plain"
                fill="outlined"
                wrapperClassName="w-fit"
                className="h-10 w-[84px]"
                inputClassName="p-0 text-center"
                value={currentValue.toLocaleString()}
                onChange={(event) => handleInputChange(event.target.value)}
              />
            </div>

            <div className="relative">
              <Slider
                size="small"
                value={[currentValue]}
                onValueChange={(nextValue) => setInnerValue(nextValue[0] ?? 0)}
                onValueCommit={handleSliderCommit}
                min={0}
                max={maxRows}
                step={100}
              />

              {lessThanMarkerPosition !== null && (
                <>
                  <div
                    aria-hidden
                    className="pointer-events-none absolute top-1/2 -translate-y-1/2 bg-[#7A7A7A]"
                    style={{
                      left: `${lessThanMarkerPosition}%`,
                      width: "1px",
                      height: "16px",
                    }}
                  />
                  <Text
                    variant="body"
                    className="pointer-events-none absolute top-full mt-1 -translate-x-1/2 p-0 text-center"
                    style={{ left: `${lessThanMarkerPosition}%` }}
                  >
                    {lessThanMarker ? lessThanMarker.toLocaleString() : ""}
                  </Text>
                </>
              )}
            </div>
          </div>
        </div>

        <div aria-hidden className="h-[152px] w-[0.5px] bg-[#7A7A7A]" />

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <Text variant="body" color="secondary">
              Credits required:
            </Text>
            <div className="flex items-center gap-1">
              <Text variant="subtitle">{currentCostLabel}</Text>
              <AiStarIcon />
            </div>
          </div>
          {totalDatasetRows && (
            <div className="flex flex-col gap-1">
              <Text variant="body" color="secondary">
                Expanded dataset size:
              </Text>
              <Text variant="subtitle">
                {totalDatasetRows.toLocaleString()}{" "}
                {totalDatasetRows === 1 ? "row" : "rows"}
              </Text>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
