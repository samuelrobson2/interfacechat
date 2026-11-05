import { DOMAIN_ICONS_MAP, type DatasetDomain } from "@/services/dataset";
import { useLanguagesQuery } from "@/services/internalization";
import { SizeMediumIcon } from "@/shared/assets/icons/size/SizeMedium";
import { useOptionsMap } from "@/shared/lib/react/use-options-map";
import { Badge } from "@/shared/ui/kit/badge";
import { MultilineInput, SendButton } from "@/shared/ui/multiline-input";
import { useInventStore } from "../model/invent-store";
import { InventBadgeTooltip } from "../ui/invent-badge-tooltip";
import { InventFileUpload } from "../ui/invent-file-upload";
import { domainOptions, sizeOptions } from "./invent-tags";

const MAX_FILES = 3;

export function InventInput() {
  const { data: languagesData } = useLanguagesQuery();

  const files = useInventStore((state) => state.files);
  const setFiles = useInventStore((state) => state.setFiles);

  const domains = useInventStore((state) => state.domains);
  const languages = useInventStore((state) => state.languages);
  const size = useInventStore((state) => state.size);
  const setSize = useInventStore((state) => state.setSize);
  const removeDomain = useInventStore((state) => state.removeDomain);
  const removeLanguage = useInventStore((state) => state.removeLanguage);

  const domainOptionsMap = useOptionsMap(domainOptions, "value");
  const sizeOptionsMap = useOptionsMap(sizeOptions, "value");
  const languageOptionsMap = useOptionsMap(languagesData?.languages, "id");

  const handleRemoveFile = (fileKey: string) => {
    const updatedFiles = new Map(files);
    updatedFiles.delete(fileKey);
    setFiles(updatedFiles);
  };

  const multiline =
    files.size > 0 || domains.size > 0 || languages.size > 0 || size !== null;

  return (
    <MultilineInput
      multiline={multiline}
      sendButton={<SendButton />}
      placeholder="Tell us about the data you would like to invent. Or upload sample data to get started"
      fileUpload={
        <InventFileUpload
          files={files}
          setFiles={setFiles}
          removeFile={handleRemoveFile}
          multiline={multiline}
          maxFiles={MAX_FILES}
        />
      }
      badges={
        <div className="flex items-center gap-1.5">
          <InventBadgeTooltip
            options={Array.from(domains)}
            className="max-w-35"
            renderOption={(option) => {
              const Icon = DOMAIN_ICONS_MAP[option as DatasetDomain];

              return (
                <>
                  <Icon
                    className="size-5 shrink-0"
                    pathClasses="stroke-current"
                  />
                  <span className="truncate">
                    {domainOptionsMap[option]?.title}
                  </span>
                </>
              );
            }}
            closable
            onRemove={removeDomain}
          />
          <InventBadgeTooltip
            options={Array.from(languages)}
            className="max-w-35"
            renderOption={(option) => languageOptionsMap[Number(option)]?.name}
            closable
            onRemove={removeLanguage}
          />
          {size && (
            <Badge
              className="max-w-50"
              key={size}
              closable
              onClose={() => setSize(null)}
            >
              <SizeMediumIcon pathClasses="stroke-current shrink-0" />{" "}
              <span className="truncate">{sizeOptionsMap[size]?.title}</span>
            </Badge>
          )}
        </div>
      }
    />
  );
}
