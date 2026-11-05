import { Text } from "@/shared/ui/kit/text";
import { Separator } from "@/shared/ui/kit/separator";
import { useGrowContext } from "../model/grow-store";
import { GrowDataAmount } from "../ui/grow-data-amount";
import { SelectedText } from "@/shared/ui/kit/selected-text";
import { calculateGrowth } from "../domain/calculate-growth";

export function GrowCountriesPercent() {
  const {
    expansion_countries_percent,
    expansion_countries,
    setCountriesPercent,
  } = useGrowContext((state) => state);
  const growth = calculateGrowth(expansion_countries_percent, [
    expansion_countries,
  ]);

  if (expansion_countries.size === 0) return null;

  return (
    <>
      <Separator orientation="horizontal" color="secondary" />
      <div className="flex w-full min-w-0 flex-col gap-6">
        <div className="flex flex-row items-start gap-12">
          <Text variant="title" className="w-2/5">
            What percentage of this dataset do you want to localize?
          </Text>
          <div className="w-3/5">
            <GrowDataAmount
              title="% of dataset to localize"
              value={expansion_countries_percent}
              onChange={setCountriesPercent}
              tooltipContent="The % indicates the fraction of the original data sampled per language at random."
            />
          </div>
        </div>

        {expansion_countries_percent > 0 && (
          <Text variant="h3" className="inline">
            Warning: This expands overall dataset size by{" "}
            <SelectedText as="span" variant="h3" className="inline">
              {growth}
            </SelectedText>
            . This will impact the number of credits required to launch this
            job.
          </Text>
        )}
      </div>
    </>
  );
}
