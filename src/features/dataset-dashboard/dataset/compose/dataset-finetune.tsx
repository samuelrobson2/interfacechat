import autoScientistImage from "@/shared/assets/images/autoscientist.png";
import { Button } from "@/shared/ui/kit/button";
import {
  DatasetConfigCard,
  DatasetConfigLayout,
  DatasetConfigSection,
} from "../ui/dataset-config-layout";
import { useDatasetSuspenseQuery } from "@/services/dataset";
import { href, useNavigate } from "react-router-dom";
import { ROUTES } from "@/shared/model/routes";
import { getFinetuneStepsData } from "@/features/dataset-finetune";
import {
  appendFinetuneEntryToRoute,
  FINETUNE_ENTRY_POINTS,
  useStartNewWizardSession,
} from "@/features/dataset-finetune";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/ui/kit/tooltip";
import { getApiErrorMessage } from "@/shared/api/api-error";
import { toast } from "@/shared/ui/kit/sonner-toast";
import { Separator } from "@/shared/ui/kit/separator";
import { useState } from "react";
import { DatasetFinetuneModelPanel } from "./dataset-finetune-model-panel";

export function DatasetFinetune() {
  const { data: dataset } = useDatasetSuspenseQuery();
  const finetunes = dataset.finetunes ?? [];
  const [selectedJobId, setSelectedJobId] = useState<string | undefined>();
  const activeJobId = selectedJobId ?? finetunes[0]?.job_id;
  const navigate = useNavigate();

  const isTrainDisabled = dataset.finetune_eligibility?.eligible === false;

  const { startNewSession, isPending: isStartingSession } =
    useStartNewWizardSession();

  const handleTrainClick = async () => {
    const datasetId = dataset.dataset_id;
    try {
      await startNewSession(datasetId);
    } catch (err) {
      toast.error(
        getApiErrorMessage(
          err,
          "Couldn't start a new training run. Please try again.",
        ),
      );
      return;
    }
    await getFinetuneStepsData(datasetId);
    navigate(
      appendFinetuneEntryToRoute(
        href(ROUTES.DATASET_FINETUNE, { dataset_id: datasetId }),
        FINETUNE_ENTRY_POINTS.dataset,
      ),
    );
  };

  const trainButton = (
    <Button
      variant="secondary"
      size="48"
      onClick={handleTrainClick}
      isLoading={isStartingSession}
      disabled={isTrainDisabled || isStartingSession}
    >
      Train
    </Button>
  );

  return (
    <DatasetConfigLayout>
      <DatasetConfigSection>
        {finetunes.length > 0 && activeJobId ? (
          <DatasetFinetuneModelPanel
            key={activeJobId}
            datasetId={dataset.dataset_id}
            jobId={activeJobId}
            finetunes={finetunes}
            onSelectJobId={setSelectedJobId}
          />
        ) : null}
      </DatasetConfigSection>

      <Separator
        color="secondary"
        orientation="vertical"
        className="hidden md:block"
      />

      <DatasetConfigSection>
        <DatasetConfigCard
          icon={<img src={autoScientistImage} alt="AutoScientist" />}
          title="AutoScientist"
          description="Adaption deploys a self-learning scientist to dynamically and continuously train the best model for your task."
          button={
            isTrainDisabled ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex">{trainButton}</span>
                </TooltipTrigger>
                <TooltipContent>
                  Multimodal support for autoscientist is coming soon
                </TooltipContent>
              </Tooltip>
            ) : (
              trainButton
            )
          }
        />
      </DatasetConfigSection>
    </DatasetConfigLayout>
  );
}
