import {
  DATASET_STATUSES,
  isFinetuneJobTerminal,
  useExperimentStatusQuery,
  type DatasetStatus,
} from "@/services/dataset";
import { getApiErrorMessage } from "@/shared/api/api-error";
import { ArrowRightIcon } from "@/shared/assets/icons/outlined/ArrowRight";
import { cn } from "@/shared/lib/css";
import { useIsMobile } from "@/shared/lib/react/use-mobile";
import { ROUTES } from "@/shared/model/routes";
import { Button } from "@/shared/ui/kit/button";
import { toast } from "@/shared/ui/kit/sonner-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/ui/kit/tooltip";
import {
  appendFinetuneEntryToRoute,
  FINETUNE_ENTRY_POINTS,
  useStartNewWizardSession,
} from "@/features/dataset-finetune";
import { href, useNavigate } from "react-router-dom";
import type { DatasetListRow } from "../model/use-datasets-table";
import { DatasetsDownloadProgress } from "../ui/datasets-download-progress";
import {
  FinetuneStatusIndicatorBadge,
  type FinetuneJobStatus,
  type FinetuneStatusIndicatorBadgeVariant,
} from "../ui/finetune-status-indicator";

// A live experiment supersedes the stored finetune status until it reaches a
// terminal state, so we fall back to the experiment status query in that window.
const shouldShowExperimentFinetuneStatus = (
  latestFinetune: DatasetListRow["latest_finetune"],
) => {
  const finetuneStatus = latestFinetune?.status;

  return (
    Boolean(latestFinetune?.training_experiment_id) &&
    (!finetuneStatus || !isFinetuneJobTerminal(finetuneStatus))
  );
};

function ExperimentFinetuneCell({
  dataset_id,
  showProgress,
  variant,
}: {
  dataset_id: string;
  showProgress: boolean;
  variant: FinetuneStatusIndicatorBadgeVariant;
}) {
  const { data } = useExperimentStatusQuery(dataset_id, true);

  const status = (data?.status ?? "running") as FinetuneJobStatus;
  const progressPercentage = data?.progress_percentage ?? null;

  return (
    <div className="flex flex-col items-start gap-3">
      {showProgress && (
        <DatasetsDownloadProgress
          progressPercentage={progressPercentage}
          className="max-w-[144px]"
          status={"ready" as DatasetStatus}
        />
      )}
      <FinetuneStatusIndicatorBadge status={status} variant={variant} />
    </div>
  );
}

function FinetuneFlowCell({
  dataset_id,
  disabled,
  tooltip,
}: {
  dataset_id: string;
  disabled: boolean;
  tooltip?: string;
}) {
  const navigate = useNavigate();
  const { startNewSession, isPending } = useStartNewWizardSession();

  // Configure is an explicit "start a new run" entry — mint a fresh
  // wizard session before navigating so the previous attempt's slider
  // values and completed-step marks don't bleed through. Fail loud on
  // mint failure: silently navigating anyway would land the user in the
  // exact stale-state bug this is fixing.
  const handleClick = async () => {
    try {
      await startNewSession(dataset_id);
    } catch (err) {
      toast.error(
        getApiErrorMessage(err, "Couldn't start a new run. Please try again."),
      );
      return;
    }
    navigate(
      appendFinetuneEntryToRoute(
        href(ROUTES.DATASET_FINETUNE, { dataset_id }),
        FINETUNE_ENTRY_POINTS.dashboard,
      ),
    );
  };

  const button = (
    <Button
      variant="link"
      onClick={handleClick}
      isLoading={isPending}
      disabled={disabled}
    >
      Configure <ArrowRightIcon pathClasses="stroke-current" />
    </Button>
  );

  if (!disabled || !tooltip) {
    return button;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex">{button}</span>
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  );
}

export function DatasetAutoscientistCell({
  row,
  showProgress = false,
  variant = "default",
  onShowError,
}: {
  row: DatasetListRow;
  showProgress?: boolean;
  variant?: FinetuneStatusIndicatorBadgeVariant;
  onShowError?: (row: DatasetListRow) => void;
}) {
  const isMobile = useIsMobile();
  const {
    dataset_id,
    status,
    is_finetuned,
    latest_finetune,
    finetune_eligibility,
  } = row;
  const finetuneStatus = latest_finetune?.status;

  if (shouldShowExperimentFinetuneStatus(latest_finetune)) {
    return (
      <ExperimentFinetuneCell
        dataset_id={dataset_id}
        showProgress={showProgress}
        variant={variant}
      />
    );
  }

  if (finetuneStatus) {
    // Both 'failed' (training-side) and 'eval_failed' (eval-side) surface an
    // error_message and an inspectable dialog. The badge text disambiguates
    // which phase failed.
    const isFailed =
      finetuneStatus === "failed" || finetuneStatus === "eval_failed";
    const datasetLink =
      finetuneStatus === "succeeded"
        ? href(ROUTES.DASHBOARD_DATASET, { dataset_id })
        : undefined;

    return (
      <div className="flex flex-col items-start gap-3">
        {showProgress && (
          <DatasetsDownloadProgress
            progressPercentage={latest_finetune.progress_percentage}
            className={cn(isMobile ? "w-full" : "max-w-[144px]")}
            status={status as DatasetStatus}
            onArrowClick={
              isFailed && onShowError ? () => onShowError(row) : undefined
            }
            arrowAriaLabel={isFailed ? "View finetune error" : undefined}
            datasetLink={datasetLink}
          />
        )}
        <FinetuneStatusIndicatorBadge
          status={finetuneStatus}
          variant={variant}
        />
      </div>
    );
  }

  if (!showProgress) {
    return <span className="text-typography-secondary">—</span>;
  }

  if (status === DATASET_STATUSES.ready && !is_finetuned && !isMobile) {
    return (
      <FinetuneFlowCell
        dataset_id={dataset_id}
        disabled={finetune_eligibility?.eligible === false}
        tooltip="Multimodal support for autoscientist is coming soon"
      />
    );
  }

  return null;
}
