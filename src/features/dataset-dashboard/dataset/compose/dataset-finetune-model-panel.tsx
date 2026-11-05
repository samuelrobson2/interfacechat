import {
  useDownloadFinetuneWeights,
  useFinetuneJobConfigQuery,
} from "@/services/dataset";
import { getApiErrorMessage } from "@/shared/api/api-error";
import type { ApiSchemas } from "@/shared/api/schema";
import { ChevronRightIcon } from "@/shared/assets/icons/outlined/ChevronRight";
import { DownloadIconNormal } from "@/shared/assets/icons/outlined/DownloadNormal";
import { Button } from "@/shared/ui/kit/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/kit/select";
import { toast } from "@/shared/ui/kit/sonner-toast";
import { Text } from "@/shared/ui/kit/text";
import { useState } from "react";
import autoScientistImage from "@/shared/assets/images/autoscientist.png";
import togetherAiImage from "@/shared/assets/images/together-ai.svg";
import { AutoscientistConfigDialog } from "../ui/fine-tune/autoscientist-config-dialog";

export function DatasetFinetuneModelPanel({
  datasetId,
  jobId,
  finetunes,
  onSelectJobId,
}: {
  datasetId: string;
  jobId: string;
  finetunes: ApiSchemas["DatasetFinetuneSummaryDto"][];
  onSelectJobId: (jobId: string) => void;
}) {
  const selectedFinetune = finetunes.find(
    (finetune) => finetune.job_id === jobId,
  );
  const { downloadFinetuneWeights, isPending: isDownloadPending } =
    useDownloadFinetuneWeights();
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const { data: jobConfig } = useFinetuneJobConfigQuery(
    datasetId,
    jobId,
    isConfigDialogOpen,
  );
  const configText = jobConfig?.best_job_config
    ? JSON.stringify(jobConfig.best_job_config, null, 2)
    : "";

  const handleWeightsExport = async () => {
    try {
      await downloadFinetuneWeights(datasetId, jobId);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not download weights"));
    }
  };

  const handleCopyConfig = async () => {
    if (!configText) return;
    try {
      await navigator.clipboard.writeText(configText);
      toast.success("Config copied to clipboard");
    } catch {
      toast.error("Could not copy config");
    }
  };

  return (
    <>
      <div className="flex w-full flex-col gap-6">
        <div className="flex max-w-md flex-col gap-2">
          <Text variant="label" color="secondary">
            Training model
          </Text>
          <Select value={jobId} onValueChange={onSelectJobId}>
            <SelectTrigger
              className="min-w-0 [&_[data-slot=select-value]]:truncate"
              size="sm"
              variant="outline"
            >
              <SelectValue placeholder="Select a training model" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {finetunes.map((finetune) => (
                  <SelectItem
                    key={finetune.job_id}
                    className="truncate"
                    value={finetune.job_id}
                  >
                    {finetune.name ?? finetune.job_id}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1">
          <Text variant="label" color="secondary">
            Training model name
          </Text>
          <Text>{selectedFinetune?.name ?? "—"}</Text>
        </div>

        <Button
          className="justify-start px-0"
          variant="link"
          onClick={handleWeightsExport}
          isLoading={isDownloadPending}
          disabled={isDownloadPending}
        >
          <img src={togetherAiImage} alt="Together AI" className="h-7" />
          Weights export
          <DownloadIconNormal />
        </Button>

        <div className="flex items-center gap-2">
          <img className="h-8" src={autoScientistImage} alt="AutoScientist" />
          <Button
            className="justify-start px-0"
            variant="link"
            onClick={() => setIsConfigDialogOpen(true)}
          >
            AutoScientist Config
            <ChevronRightIcon />
          </Button>
        </div>
      </div>

      <AutoscientistConfigDialog
        isConfigDialogOpen={isConfigDialogOpen}
        setIsConfigDialogOpen={setIsConfigDialogOpen}
        autoScientistConfigText={configText}
        canCopyConfig={Boolean(configText)}
        handleCopyConfig={handleCopyConfig}
      />
    </>
  );
}
