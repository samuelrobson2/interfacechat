import { PlusSmallIcon } from "@/shared/assets/icons/outlined/PlusSmall";
import { useLanguagesQuery } from "@/services/internalization";
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

export function GrowNewLanguages({ title }: { title: string }) {
  const [addOpen, setAddOpen] = useState(false);
  const { data: languagesData, isLoading: isLoadingLanguages } =
    useLanguagesQuery();
  const expansion_languages = useGrowContext(
    (state) => state.expansion_languages,
  );
  const addLanguage = useGrowContext((state) => state.addLanguage);
  const removeLanguage = useGrowContext((state) => state.removeLanguage);

  const languageOptionsMap = useOptionsMap(languagesData?.languages, "code");

  return (
    <GrowItemLayout>
      <div className="flex flex-col gap-6">
        <GrowItemLayoutTitle title={title} />

        {expansion_languages.size > 0 && (
          <div className="flex flex-wrap gap-2">
            {Array.from(expansion_languages).map((language) => (
              <Badge
                key={language}
                closable
                onClose={() => removeLanguage(language)}
              >
                {languageOptionsMap?.[language]?.name}
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
              <PlusSmallIcon pathClasses="stroke-current" /> Add language
            </Button>
          }
          commandProps={{
            filter: commandKeywordsStartsWithFilter,
          }}
        >
          <CommandEmpty>No languages found.</CommandEmpty>
          <CommandGroup isLoading={isLoadingLanguages}>
            {languagesData?.languages?.map((language) => (
              <CommandItem
                key={language.id}
                value={language.code}
                keywords={[language.name]}
                isSelected={expansion_languages.has(language.code)}
                onSelect={(code) => {
                  addLanguage(code);
                  setAddOpen(false);
                }}
              >
                {language.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </PopupButton>
      </div>
    </GrowItemLayout>
  );
}
