import huggingfaceImage from "@/shared/assets/images/huggingface.svg";
import kaggleImage from "@/shared/assets/images/kaggle.svg";
import { RadioGroup, RadioGroupItem } from "@/shared/ui/kit/radio-group";

import {
  AddApiKeyDialog,
  type ImportSourceProvider,
} from "@/services/settings";
import { ArrowRightIcon } from "@/shared/assets/icons/outlined/ArrowRight";
import { Button } from "@/shared/ui/kit/button";
import { useLinkImportStore } from "../model/link/link-import-store";
import { usePostLink } from "../model/link/use-post-link";
import { LinkImportCard } from "../ui/link-import-card";
import { LinkImportDatasetsListDialog } from "./link-import-datasets-list-dialog";

interface ImportSource {
  value: ImportSourceProvider;
  hasApiKey: boolean;
  icon: React.ReactNode;
  title: string;
  description: string;
}

const importSources: ImportSource[] = [
  {
    value: "huggingface",
    hasApiKey: false,
    icon: (
      <img
        src={huggingfaceImage}
        className="w-[52px] h-[48px]"
        alt="Hugging Face"
      />
    ),
    title: "Import from Hugging Face",
    description: "Create from a Hugging Face repository archive",
  },
  {
    value: "kaggle",
    hasApiKey: false,
    icon: <img src={kaggleImage} className="w-[60px] h-[24px]" alt="Kaggle" />,
    title: "Import from Kaggle",
    description: "Create from a Kaggle repository archive",
  },
];

export function LinkImport() {
  const selectedSource = useLinkImportStore((state) => state.selectedSource);
  const setSelectedSource = useLinkImportStore(
    (state) => state.setSelectedSource,
  );
  const openAddApiKeyDialog = useLinkImportStore(
    (state) => state.openAddApiKeyDialog,
  );
  const setOpenAddApiKeyDialog = useLinkImportStore(
    (state) => state.setOpenAddApiKeyDialog,
  );
  const linkImportUrl = useLinkImportStore((state) => state.linkImportUrl);

  const {
    postLink,
    isPending: isPostPending,
    errorMessage: errorMessagePost,
  } = usePostLink();

  return (
    <div className="w-full">
      <RadioGroup
        className="flex flex-col gap-3.5 w-full"
        value={selectedSource}
        onValueChange={(value) =>
          setSelectedSource(value as ImportSourceProvider)
        }
      >
        {importSources.map((source) => (
          <LinkImportCard
            formId={`link-import-form-${source.value}`}
            key={source.value}
            icon={source.icon}
            title={source.title}
            description={source.description}
            isSelected={selectedSource === source.value}
            importSource={source.value}
            action={<RadioGroupItem value={source.value} id={source.value} />}
            errorMessage={errorMessagePost?.[source.value]}
            onSubmit={(data) => postLink(data.url, source.value)}
          />
        ))}
      </RadioGroup>

      {selectedSource && (
        <Button
          form={`link-import-form-${selectedSource}`}
          className="absolute bottom-8 right-12"
          type="submit"
          isLoading={isPostPending}
        >
          Import <ArrowRightIcon pathClasses="stroke-current" />
        </Button>
      )}

      <LinkImportDatasetsListDialog key={linkImportUrl} />

      {selectedSource === "huggingface" && (
        <AddApiKeyDialog
          open={openAddApiKeyDialog}
          onOpenChange={setOpenAddApiKeyDialog}
          action="Add"
          showDescription
          provider={selectedSource}
        />
      )}
    </div>
  );
}
