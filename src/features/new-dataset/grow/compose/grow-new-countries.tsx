import { PlusSmallIcon } from "@/shared/assets/icons/outlined/PlusSmall";
import {
  CountryFlag,
  useLanguageCountryPairsQuery,
} from "@/services/internalization";
import { useOptionsMap } from "@/shared/lib/react/use-options-map";
import { Badge } from "@/shared/ui/kit/badge";
import { Button } from "@/shared/ui/kit/button";
import {
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/shared/ui/kit/command";
import { PopupButton } from "@/shared/ui/popup-button";
import { useState } from "react";
import { commandKeywordsStartsWithFilter } from "../../_lib/command-keywords-filter";
import { useGrowContext } from "../model/grow-store";
import { GrowItemLayout, GrowItemLayoutTitle } from "../ui/grow-item-layout";

export function GrowNewContries({ title }: { title: string }) {
  const [addOpen, setAddOpen] = useState(false);
  const { data: languageCountryPairsData, isLoading } =
    useLanguageCountryPairsQuery();
  const languageCountryPairs = languageCountryPairsData?.languageCountryPairs;
  const expansion_countries = useGrowContext(
    (state) => state.expansion_countries,
  );
  const addCountry = useGrowContext((state) => state.addCountry);
  const removeCountry = useGrowContext((state) => state.removeCountry);

  const countryOptionsMap = useOptionsMap(languageCountryPairs, "pairKey");
  return (
    <GrowItemLayout>
      <div className="flex flex-col gap-6">
        <GrowItemLayoutTitle title={title} />

        {expansion_countries.size > 0 && (
          <div className="flex flex-wrap gap-2">
            {Array.from(expansion_countries).map((country) => (
              <Badge
                key={country}
                closable
                onClose={() => removeCountry(country)}
              >
                <CountryFlag
                  languageFlag
                  countryCode={countryOptionsMap?.[country]?.countryCode || ""}
                />
                {countryOptionsMap?.[country]?.countryName} (
                {countryOptionsMap?.[country]?.languageName})
              </Badge>
            ))}
          </div>
        )}

        <PopupButton
          open={addOpen}
          onOpenChange={setAddOpen}
          contentProps={{
            side: "right",
            className: "flex flex-col",
          }}
          trigger={
            <Button variant="link" className="self-start">
              <PlusSmallIcon pathClasses="stroke-current" /> Add country
            </Button>
          }
          commandProps={{
            filter: commandKeywordsStartsWithFilter,
          }}
        >
          <CommandEmpty>No countries found.</CommandEmpty>
          <CommandGroup isLoading={isLoading}>
            {(languageCountryPairs ?? []).map((pair) => (
              <CommandItem
                key={pair.pairKey}
                value={pair.pairKey}
                keywords={[pair.countryName, pair.languageName]}
                isSelected={expansion_countries.has(pair.pairKey)}
                onSelect={(pairKey) => {
                  addCountry(pairKey);
                  setAddOpen(false);
                }}
              >
                <div className="flex items-center gap-2">
                  <CountryFlag languageFlag countryCode={pair.countryCode} />
                  {pair.countryName} ({pair.languageName})
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </PopupButton>
      </div>
    </GrowItemLayout>
  );
}
