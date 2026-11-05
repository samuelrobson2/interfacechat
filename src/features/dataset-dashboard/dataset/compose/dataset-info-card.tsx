import {
  DatasetInfoEditableItem,
  getDomainColorizedIcon,
  useDatasetExportLinksQuery,
} from "@/services/dataset";
import { CopyIcon } from "@/shared/assets/icons/general/Copy";
import { ChevronRightIcon } from "@/shared/assets/icons/outlined/ChevronRight";
import { cn } from "@/shared/lib/css";
import { Button } from "@/shared/ui/kit/button";
import { toast } from "@/shared/ui/kit/sonner-toast";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { DatasetRoutes, PathParams } from "@/shared/model/routes";
import { useDatasetInfoPatch } from "../model/use-dataset-info-patch";
import huggingfaceImage from "@/shared/assets/images/huggingface.svg";
import kaggleImage from "@/shared/assets/images/kaggle.svg";
import googleSheetsImage from "@/shared/assets/images/google-sheets.svg";
import { Text } from "@/shared/ui/kit/text";
import { Separator } from "@/shared/ui/kit/separator";
import { useDatasetCache } from "@/services/dataset";
import { DatasetExportLink } from "../ui/datsaet-export-link";
import { ExpandedText } from "@/shared/ui/kit/expanded-text";
import { DatasetCombineSources } from "../ui/dataset-combine-sources";
import { DatasetMeasureSectionTitle } from "./dataset-measure-section-title";

export function DatasetInfoCard() {
  const { dataset_id } = useParams<PathParams[DatasetRoutes]>();
  const { data: exportLinks } = useDatasetExportLinksQuery();
  const datasetData = useDatasetCache();
  const { patchDatasetInfo, optimisticDataset, isPending } =
    useDatasetInfoPatch();

  const handleCopyDatasetId = async () => {
    if (!dataset_id) return;
    try {
      await navigator.clipboard.writeText(dataset_id);
      toast.success("Dataset ID copied to clipboard");
    } catch {
      toast.error("Failed to copy dataset ID");
    }
  };

  const huggingfaceLink = exportLinks?.huggingface?.trim();
  const kaggleLink = exportLinks?.kaggle?.trim();
  const googleSheetsLink = exportLinks?.google_sheets?.trim();
  const isCombined = datasetData?.kind === "combined";
  const topDomain = datasetData?.metadata?.dataset_top_domain;
  const domainIcon = getDomainColorizedIcon(
    typeof topDomain === "string" ? topDomain : "",
  );

  const [isSystemPromptOpen, setIsSystemPromptOpen] = useState(false);
  const systemPrompt =
    datasetData?.base_numi_config?.brandControl?.system_prompt?.trim();

  return (
    <div className="flex flex-col gap-[32px]">
      <DatasetMeasureSectionTitle
        overline="ADAPTIVE DATA · TRAINING METRICS"
        title="Adaptive Data"
      />

      <div
        className={cn(
          "flex flex-col gap-6 md:flex-row",
          isPending && "opacity-50",
        )}
      >
        <img
          className="h-[90px] w-[90px] shrink-0 object-contain"
          src={domainIcon}
          alt={topDomain || "other"}
        />
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-6 md:flex-row md:justify-between md:gap-[120px]">
            <DatasetInfoEditableItem
              disabled={isPending}
              value={optimisticDataset.name}
              onSubmit={(value) => patchDatasetInfo({ name: value })}
              maxTextLines={1}
              title="Dataset Name"
              label="Dataset Name"
              name="dataset_name"
            />
            <DatasetInfoEditableItem
              disabled={isPending}
              value={optimisticDataset.description}
              onSubmit={(value) => patchDatasetInfo({ description: value })}
              maxTextLines={3}
              title="Description"
              label="Description"
              inputType="textarea"
              name="description"
            />
          </div>
          <Separator
            color="secondary"
            className="data-[orientation=horizontal]:h-[0.5px]"
          />
          <div className="flex flex-col gap-6 md:flex-row md:justify-between">
            <div className={cn("flex flex-col gap-1")}>
              <Text variant="label" color="secondary">
                Prompt length
              </Text>
              <Text>{datasetData?.metadata?.average_prompt_length} words</Text>
            </div>
            <div className={cn("flex flex-col gap-1")}>
              <Text variant="label" color="secondary">
                Completion length
              </Text>
              <Text>
                {datasetData?.metadata?.average_completion_length} words
              </Text>
            </div>
            <div className={cn("flex flex-col gap-1")}>
              <Text variant="label" color="secondary">
                Dataset size
              </Text>
              <Text>{datasetData?.samples_to_process} rows</Text>
            </div>
            {dataset_id && (
              <div className={cn("flex flex-col gap-1")}>
                <Text variant="label" color="secondary">
                  Dataset ID
                </Text>
                <div className="flex items-end gap-1">
                  <Text>{dataset_id}</Text>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon_6"
                    onClick={handleCopyDatasetId}
                    aria-label="Copy dataset ID"
                  >
                    <CopyIcon />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {(isCombined ||
            datasetData?.source_link ||
            huggingfaceLink ||
            kaggleLink ||
            googleSheetsLink) && (
            <>
              <Separator
                color="secondary"
                className="data-[orientation=horizontal]:h-[0.5px]"
              />
              <div className="mt-auto flex flex-wrap items-end gap-6">
                {isCombined && datasetData?.sources && (
                  <DatasetCombineSources
                    sources={datasetData.sources}
                    className="mr-4"
                  />
                )}
                {!isCombined && datasetData?.source_link && (
                  <Button className="mr-4 justify-start" variant="link" asChild>
                    <Link
                      to={datasetData.source_link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Original dataset
                      <ChevronRightIcon />
                    </Link>
                  </Button>
                )}
                {huggingfaceLink && (
                  <DatasetExportLink
                    link={huggingfaceLink}
                    image={huggingfaceImage}
                  />
                )}
                {kaggleLink && (
                  <DatasetExportLink link={kaggleLink} image={kaggleImage} />
                )}
                {googleSheetsLink && (
                  <DatasetExportLink
                    link={googleSheetsLink}
                    image={googleSheetsImage}
                  />
                )}
              </div>
            </>
          )}
          {systemPrompt && (
            <>
              <Separator
                color="secondary"
                className="data-[orientation=horizontal]:h-[0.5px]"
              />
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  className="flex items-center gap-1"
                  aria-expanded={isSystemPromptOpen}
                  onClick={() => setIsSystemPromptOpen((open) => !open)}
                >
                  <Text>Your Blueprint</Text>
                  <ChevronRightIcon
                    pathClasses="stroke-current"
                    svgClasses={cn(
                      "transition-transform",
                      isSystemPromptOpen && "rotate-90",
                    )}
                  />
                </button>
                {isSystemPromptOpen && (
                  <ExpandedText className="w-full min-w-0" maxLines={2}>
                    {systemPrompt}
                  </ExpandedText>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
