import {
  DatasetAddButton,
  DatasetTagsCard,
  DOMAIN_ICONS_MAP,
  type DatasetDomain,
} from "@/services/dataset";
import { useLanguagesQuery } from "@/services/internalization";
import { SizeMediumIcon } from "@/shared/assets/icons/size/SizeMedium";
import dataSizeImage from "@/shared/assets/images/data-size.png";
import globeImage from "@/shared/assets/images/globe.png";
import inclinedCirclesImage from "@/shared/assets/images/inclined-circles.png";
import { useOptionsMap } from "@/shared/lib/react/use-options-map";
import { Badge } from "@/shared/ui/kit/badge";
import { CommandItem } from "@/shared/ui/kit/command";
import { useInventStore } from "../model/invent-store";
import { InventBadgeTooltip } from "../ui/invent-badge-tooltip";

// TODO: Replace with backend data
export const domainOptions = [
  { value: "medical", title: "Medical" },
  { value: "marketing", title: "Marketing" },
  { value: "architecture-design", title: "Design" },
  { value: "technology", title: "Technology" },
  { value: "code", title: "Code" },
];

// TODO: Replace with backend data
export const sizeOptions = [
  { value: "5", title: "5k", isPremium: false },
  { value: "10", title: "10k", isPremium: false },
  { value: "50", title: "50k", isPremium: true },
  { value: "100", title: "100k", isPremium: true },
  { value: "500", title: "500k", isPremium: true },
];

export function InventTags() {
  const { data: languagesData, isLoading: isLanguagesLoading } =
    useLanguagesQuery();

  const domains = useInventStore((state) => state.domains);
  const languages = useInventStore((state) => state.languages);
  const size = useInventStore((state) => state.size);
  const addDomain = useInventStore((state) => state.addDomain);
  const addLanguage = useInventStore((state) => state.addLanguage);
  const setSize = useInventStore((state) => state.setSize);
  const removeDomain = useInventStore((state) => state.removeDomain);
  const removeLanguage = useInventStore((state) => state.removeLanguage);

  const domainOptionsMap = useOptionsMap(domainOptions, "value");
  const sizeOptionsMap = useOptionsMap(sizeOptions, "value");
  const languageOptionsMap = useOptionsMap(languagesData?.languages, "id");

  return (
    <div className="flex gap-4 w-full">
      <DatasetTagsCard
        title="Domain"
        icon={
          <img
            className="size-25 self-center"
            src={inclinedCirclesImage}
            alt="Domains"
          />
        }
        action={
          <DatasetAddButton>
            {domainOptions?.map((option) => {
              const Icon = DOMAIN_ICONS_MAP[option.value as DatasetDomain];

              return (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={(item) => addDomain(item)}
                  isSelected={domains.has(option.value)}
                >
                  <Icon className="size-5" pathClasses="stroke-current" />
                  {option.title}
                </CommandItem>
              );
            })}
          </DatasetAddButton>
        }
      >
        <InventBadgeTooltip
          options={Array.from(domains)}
          renderOption={(option) => {
            const Icon = DOMAIN_ICONS_MAP[option as DatasetDomain];

            return (
              <>
                <Icon className="size-5" pathClasses="stroke-current" />
                {domainOptionsMap[option]?.title}
              </>
            );
          }}
          closable
          onRemove={removeDomain}
        />
      </DatasetTagsCard>

      <DatasetTagsCard
        title="Language"
        icon={
          <img
            className="size-25 self-center"
            src={globeImage}
            alt="Languages"
          />
        }
        action={
          <DatasetAddButton isLoading={isLanguagesLoading}>
            {languagesData?.languages.map((language) => (
              <CommandItem
                key={language.id}
                value={language.id.toString()}
                onSelect={(item) => addLanguage(item)}
                isSelected={languages.has(language.id.toString())}
              >
                {language.name}
              </CommandItem>
            ))}
          </DatasetAddButton>
        }
      >
        <InventBadgeTooltip
          options={Array.from(languages)}
          renderOption={(option) => languageOptionsMap[Number(option)]?.name}
          closable
          onRemove={removeLanguage}
        />
      </DatasetTagsCard>

      <DatasetTagsCard
        title="Size"
        icon={
          <img className="size-25 self-center" src={dataSizeImage} alt="Size" />
        }
        action={
          <DatasetAddButton buttonText="Add size">
            {sizeOptions?.map((option) => (
              <CommandItem
                key={option.value}
                value={option.value}
                onSelect={setSize}
                isSelected={size === option.value}
              >
                {option.title}
                {option.isPremium && (
                  <Badge size="sm" key={option.value}>
                    Plus
                  </Badge>
                )}
              </CommandItem>
            ))}
          </DatasetAddButton>
        }
      >
        {size && (
          <Badge key={size} closable onClose={() => setSize(null)}>
            <SizeMediumIcon pathClasses="stroke-current" />{" "}
            {sizeOptionsMap[size]?.title}
          </Badge>
        )}
      </DatasetTagsCard>
    </div>
  );
}
