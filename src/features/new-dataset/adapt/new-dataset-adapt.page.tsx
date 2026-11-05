import { useSearchParamsTabs } from "@/shared/lib/react/use-search-params-tabs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/kit/tabs";
import { FileUpload } from "./compose/file-upload";
import { LinkImport } from "./compose/link-import";
import { useUploadStore } from "./model/file/upload-store";
import { Text } from "@/shared/ui/kit/text";

type NewDatasetAdaptTabs = "file" | "link";
const NEW_DATASET_ADAPT_TABS: NewDatasetAdaptTabs[] = ["file", "link"];

const mapTabToTitle: Record<NewDatasetAdaptTabs, string> = {
  file: "Upload dataset",
  link: "Import data",
};

function NewDatasetAdaptPage() {
  const isUploading = useUploadStore((state) => state.isUploading);
  const { tab, handleTabChange } = useSearchParamsTabs<NewDatasetAdaptTabs>(
    NEW_DATASET_ADAPT_TABS,
    "link",
  );

  return (
    <div className="h-screen flex flex-col items-center gap-10 w-full pt-25 pb-8 max-w-[1288px] mx-auto px-[200px]">
      <Text variant="h1">
        {isUploading ? "Preparing for adaption magic" : mapTabToTitle[tab]}
      </Text>

      <Tabs
        className="w-full gap-15 items-center h-full"
        value={tab}
        onValueChange={handleTabChange}
      >
        <TabsList>
          <TabsTrigger value="link" disabled={isUploading}>
            Link
          </TabsTrigger>
          <TabsTrigger value="file" disabled={isUploading}>
            File
          </TabsTrigger>
        </TabsList>
        <TabsContent className="w-full" value="link">
          <LinkImport />
        </TabsContent>
        <TabsContent className="w-full" value="file">
          <FileUpload />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export const Component = NewDatasetAdaptPage;
