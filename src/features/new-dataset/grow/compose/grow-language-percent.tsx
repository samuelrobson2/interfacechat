import { useGrowContext } from "../model/grow-store";
import { GrowDataAmount } from "../ui/grow-data-amount";
import { Text } from "@/shared/ui/kit/text";
import { Separator } from "@/shared/ui/kit/separator";
import { SelectedText } from "@/shared/ui/kit/selected-text";
import { calculateGrowth } from "../domain/calculate-growth";

export function GrowLanguagePercent() {
  const {
    expansion_languages_percent,
    expansion_languages,
    setLanguagesPercent,
  } = useGrowContext((state) => state);

  const growth = calculateGrowth(expansion_languages_percent, [
    expansion_languages,
  ]);

  if (expansion_languages.size === 0) return null;
  return (
    <>
      <Separator orientation="horizontal" color="secondary" />
      <div className="flex w-full min-w-0 flex-col gap-6">
        <div className="flex flex-row items-start gap-12">
          <Text variant="title" className="w-2/5">
            What percentage of this dataset do you want to translate?
          </Text>
          <div className="w-3/5">
            <GrowDataAmount
              title="% of dataset to translate"
              value={expansion_languages_percent}
              onChange={setLanguagesPercent}
              tooltipContent="The % indicates the fraction of the original data sampled per language at random."
            />
          </div>
        </div>

        {expansion_languages_percent > 0 && (
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
