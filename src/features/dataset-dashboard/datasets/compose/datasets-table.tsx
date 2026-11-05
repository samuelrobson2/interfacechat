import {
  DATASET_STATUSES,
  datasetStatuses,
  DatasetStatusIndicatorBadge,
  getDatasetLink,
  isFinetuneJobTerminal,
  isDatasetReady,
  useDeleteDataset,
  useExperimentStatusQuery,
  type DatasetStatus,
} from "@/services/dataset";
import { ArrowRightIcon } from "@/shared/assets/icons/outlined/ArrowRight";
import { ChevronLeftIcon } from "@/shared/assets/icons/outlined/ChevronLeft";
import { ChevronRightIcon } from "@/shared/assets/icons/outlined/ChevronRight";
import { cn } from "@/shared/lib/css";
import { Button } from "@/shared/ui/kit/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/kit/table";
import { flexRender, type ColumnDef } from "@tanstack/react-table";
import { useIsMobile } from "@/shared/lib/react/use-mobile";
import { useMemo, useState, useTransition } from "react";
import { href, Link, useNavigate } from "react-router-dom";
import {
  useDatasetsTable,
  type DatasetListRow,
} from "../model/use-datasets-table";
import { DatasetsCards } from "../ui/datasets-cards";
import { DatasetsCombobox } from "../ui/datasets-combobox";
import { DatasetsDownloadProgress } from "../ui/datasets-download-progress";
import { DatasetsHeader } from "../ui/datasets-header";
import {
  DatasetsPaginationLayout,
  DatasetsPaginationPage,
  DatasetsPaginationPerPage,
} from "../ui/datasets-pagination";
import { DatasetsTableEmpty } from "../ui/datasets-table-empty";
import { ROUTES } from "@/shared/model/routes";
import { isDownloadReady } from "../../dataset-download-check";
import { CrossLargeIcon } from "@/shared/assets/icons/outlined/CrossLarge";
import { TooltipContent, TooltipTrigger } from "@/shared/ui/kit/tooltip";
import { Tooltip } from "@/shared/ui/kit/tooltip";
import { DatasetHideDialog } from "../../dataset/ui/dataset-hide-dialog";
import {
  FinetuneStatusIndicatorBadge,
  type FinetuneJobStatus,
} from "../ui/finetune-status-indicator";
import { RetryFinetuneButton } from "../ui/retry-finetune-button";
import { RetryAdaptionButton } from "../ui/retry-adaption-button";
import { FinetuneErrorDialog } from "../ui/finetune-error-dialog";
import { DatasetKindBadge } from "../ui/dataset-kind-badge";
import { DatasetInterfaceCell } from "../ui/dataset-interface-cell";
import { formatFinetuneWinRatePct } from "../lib/format-finetune-win-rate";
import {
  appendFinetuneEntryToRoute,
  FINETUNE_ENTRY_POINTS,
  useStartNewWizardSession,
} from "@/features/dataset-finetune";
import { getApiErrorMessage } from "@/shared/api/api-error";
import { toast } from "@/shared/ui/kit/sonner-toast";

function DatasetDate({ value }: { value: string }) {
  const date = new Date(value);
  const tooltip = date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
  const formatted = date.toLocaleDateString("en-US", {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
  });
  return <span title={tooltip}>{formatted}</span>;
}

function ExperimentFinetuneCell({ dataset_id }: { dataset_id: string }) {
  const { data } = useExperimentStatusQuery(dataset_id, true);

  const status = (data?.status ?? "running") as FinetuneJobStatus;
  const progressPercentage = data?.progress_percentage ?? null;

  return (
    <div className="flex flex-col items-start gap-3">
      <DatasetsDownloadProgress
        progressPercentage={progressPercentage}
        className="max-w-[144px]"
        status={"ready" as DatasetStatus}
      />
      <FinetuneStatusIndicatorBadge status={status} />
    </div>
  );
}

function DefaultActionCell({
  status,
  dataset_id,
  progress_percentage_live,
}: Pick<DatasetListRow, "status" | "dataset_id" | "progress_percentage_live">) {
  return (
    <Button
      variant="link"
      asChild
      disabled={
        (status === DATASET_STATUSES.launching &&
          !isDownloadReady(progress_percentage_live)) ||
        status === DATASET_STATUSES.uploading
      }
    >
      <Link to={getDatasetLink(status as DatasetStatus, dataset_id)}>
        {isDatasetReady(status as DatasetStatus) ? "View" : "Configure"}{" "}
        <ArrowRightIcon pathClasses="stroke-current" />
      </Link>
    </Button>
  );
}

function DatasetActionCell({ row }: { row: DatasetListRow }) {
  const hasTrainingExperiment = Boolean(
    row.latest_finetune?.training_experiment_id,
  );
  const { data: experimentData } = useExperimentStatusQuery(
    row.dataset_id,
    hasTrainingExperiment,
  );

  if (
    (hasTrainingExperiment && experimentData?.status === "failed") ||
    row.latest_finetune?.status === "failed" ||
    row.latest_finetune?.status === "eval_failed"
  ) {
    return <RetryFinetuneButton dataset_id={row.dataset_id} />;
  }

  if (row.status === DATASET_STATUSES.failed) {
    return <RetryAdaptionButton dataset_id={row.dataset_id} />;
  }

  return (
    <DefaultActionCell
      status={row.status}
      dataset_id={row.dataset_id}
      progress_percentage_live={row.progress_percentage_live}
    />
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
        getApiErrorMessage(
          err,
          "Couldn't start a new run. Please try again.",
        ),
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

const pageSizeOptions = [
  { label: "5", value: "5" },
  { label: "10", value: "10" },
  { label: "20", value: "20" },
  { label: "30", value: "30" },
];

const dateOptions = [
  { label: "All time", value: "" },
  { label: "Last month", value: "month" },
  { label: "Last 3 months", value: "3month" },
  { label: "Last year", value: "2025" },
];

export function DatasetsTable() {
  // Workaround for TanStack Table bug with React Compiler
  // https://github.com/shadcn-ui/ui/issues/3905#issuecomment-2692272028
  "use no memo";

  const isMobile = useIsMobile();
  const [isPending, startTransition] = useTransition();
  const [datasetId, satDasetId] = useState<string | null>(null);
  const [errorDialogRow, setErrorDialogRow] = useState<DatasetListRow | null>(
    null,
  );
  const { deleteDataset, isPending: isDeletePending } = useDeleteDataset();

  const columns: ColumnDef<DatasetListRow>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "NAME",
        cell: (props) => props.row.original.name,
      },
      {
        accessorKey: "kind",
        header: "TYPE",
        cell: (props) => <DatasetKindBadge kind={props.row.original.kind} />,
      },
      {
        accessorKey: "metadata.dataset_description",
        header: "DESCRIPTION",
        cell: (props) => {
          const description =
            props.row.original.metadata?.dataset_description ?? null;
          if (!description) return "—";

          return (
            <span
              className="line-clamp-2 whitespace-normal"
              title={description}
            >
              {description}
            </span>
          );
        },
      },
      {
        accessorKey: "created_at",
        header: "DATE",
        cell: (props) => <DatasetDate value={props.getValue() as string} />,
      },
      {
        accessorKey: "status",
        header: "ADAPTIVE DATA",
        cell: (props) => {
          const { progress_percentage_live, kind } = props.row.original;

          if (kind === "combined") {
            // Combined datasets bypass the standard ingest + eval pipeline.
            return <span className="text-typography-secondary">—</span>;
          }

          const datasetLink = `${href(ROUTES.DASHBOARD_DATASET, {
            dataset_id: props.row.original.dataset_id,
          })}${isDownloadReady(progress_percentage_live) ? "?tab=share" : ""}`;

          return (
            <div className="flex flex-col items-start gap-3">
              <DatasetsDownloadProgress
                progressPercentage={progress_percentage_live}
                datasetLink={datasetLink}
                className={cn(isMobile ? "w-full" : "max-w-[144px]")}
                status={props.getValue() as DatasetStatus}
              />
              <DatasetStatusIndicatorBadge
                state={props.getValue() as DatasetStatus}
              />
            </div>
          );
        },
      },
      {
        id: "finetune",
        header: "AUTOSCIENTIST",
        cell: (props) => {
          const row = props.row.original;
          const {
            dataset_id,
            status,
            is_finetuned,
            latest_finetune,
            finetune_eligibility,
          } = row;
          const finetuneStatus = latest_finetune?.status;
          const shouldShowExperimentStatus =
            Boolean(latest_finetune?.training_experiment_id) &&
            (!finetuneStatus || !isFinetuneJobTerminal(finetuneStatus));

          if (shouldShowExperimentStatus) {
            return <ExperimentFinetuneCell dataset_id={dataset_id} />;
          }

          if (finetuneStatus) {
            // Both 'failed' (training-side) and 'eval_failed' (eval-side)
            // surface an error_message and an inspectable dialog. The badge
            // text disambiguates which phase failed.
            const isFailed =
              finetuneStatus === "failed" || finetuneStatus === "eval_failed";
            const datasetLink =
              finetuneStatus === "succeeded"
                ? href(ROUTES.DASHBOARD_DATASET, { dataset_id })
                : undefined;

            return (
              <div className="flex flex-col items-start gap-3">
                <DatasetsDownloadProgress
                  progressPercentage={latest_finetune.progress_percentage}
                  className={cn(isMobile ? "w-full" : "max-w-[144px]")}
                  status={status as DatasetStatus}
                  onArrowClick={
                    isFailed ? () => setErrorDialogRow(row) : undefined
                  }
                  arrowAriaLabel={isFailed ? "View finetune error" : undefined}
                  datasetLink={datasetLink}
                />
                <FinetuneStatusIndicatorBadge status={finetuneStatus} />
              </div>
            );
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
        },
      },
      {
        id: "interface",
        header: "INTERFACE",
        cell: (props) => <DatasetInterfaceCell row={props.row.original} />,
      },
      {
        id: "win_rate",
        header: "WIN RATE",
        cell: (props) =>
          formatFinetuneWinRatePct(props.row.original.latest_finetune?.win_rates),
      },
      {
        id: "action",
        header: "ACTION",
        cell: (props) => <DatasetActionCell row={props.row.original} />,
      },
    ],
    [isMobile],
  );

  const {
    table,
    pageOptions,
    isEmpty,
    showPagination,
    setPeriod,
    setStatus,
    refetchDatasets,
  } = useDatasetsTable({
    columns,
  });

  const handleDeleteDataset = (dataset_id: string) => {
    startTransition(async () => {
      await deleteDataset(dataset_id, () => refetchDatasets());
    });
  };

  const handleHideConfirm = () => {
    if (datasetId) {
      handleDeleteDataset(datasetId);
      satDasetId(null);
    }
  };

  return (
    <div className="flex flex-col md:h-full md:overflow-hidden">
      <DatasetHideDialog
        open={datasetId !== null}
        onOpenChange={(open) => {
          if (!open) satDasetId(null);
        }}
        datasetId={datasetId}
        onHideConfirm={handleHideConfirm}
        isPending={isDeletePending}
      />
      <FinetuneErrorDialog
        open={!!errorDialogRow}
        onOpenChange={(open) => {
          if (!open) setErrorDialogRow(null);
        }}
        errorMessage={errorDialogRow?.latest_finetune?.error_message ?? null}
        datasetId={errorDialogRow?.dataset_id ?? null}
      />

      <DatasetsHeader
        onRefresh={() =>
          startTransition(async () => {
            await refetchDatasets();
          })
        }
      >
        <DatasetsCombobox
          label="Status"
          items={datasetStatuses}
          onValueChange={(option) =>
            startTransition(() =>
              setStatus((option as { value: DatasetStatus })?.value),
            )
          }
          disabled={isPending}
        />
        <DatasetsCombobox
          label="Period"
          items={dateOptions}
          onValueChange={(option) =>
            startTransition(() =>
              setPeriod((option as { value: string })?.value),
            )
          }
          disabled={isPending}
        />
      </DatasetsHeader>

      {isMobile ? (
        isEmpty ? (
          <div className="mt-6 flex flex-1 items-center justify-center text-center">
            <DatasetsTableEmpty
              colSpan={table.getAllColumns().length}
              isMobile
            />
          </div>
        ) : (
          <DatasetsCards
            rows={table.getRowModel().rows}
            isPending={isPending}
          />
        )
      ) : (
        <Table
          wrapperClassName={cn("mt-6", isEmpty ? "h-full" : "max-h-full")}
          className={cn(isPending && "opacity-50")}
        >
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {!isEmpty ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="group"
                >
                  {row.getAllCells().map((cell, index) => (
                    <TableCell key={cell.id} className="whitespace-normal py-2">
                      {index === 0 &&
                      row.original.status !== DATASET_STATUSES.launching ? (
                        <div className="relative">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                type="button"
                                className="absolute left-0 top-1/2 hidden -translate-y-1/2 group-hover:block"
                                onClick={() =>
                                  satDasetId(row.original.dataset_id)
                                }
                                disabled={isPending || isDeletePending}
                              >
                                <CrossLargeIcon svgClasses="size-6" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent className="absolute left-3 top-8 w-[130px]">
                              Delete dataset
                            </TooltipContent>
                          </Tooltip>
                          <div className="transition-transform duration-150 group-hover:translate-x-8">
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </div>
                        </div>
                      ) : (
                        flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <DatasetsTableEmpty colSpan={table.getAllColumns().length} />
            )}
          </TableBody>
        </Table>
      )}
      {showPagination && (
        <DatasetsPaginationLayout>
          <DatasetsPaginationPerPage
            pageSize={table.getState().pagination.pageSize}
            onPageSizeChange={(value) =>
              startTransition(() => table.setPageSize(Number(value)))
            }
            disabled={isPending}
            options={pageSizeOptions}
          />
          <DatasetsPaginationPage
            currentPage={table.getState().pagination.pageIndex + 1}
            onCurrentPageChange={(value) =>
              startTransition(() => table.setPageIndex(Number(value) - 1))
            }
            disabled={isPending}
            options={pageOptions}
            totalPages={table.getPageCount()}
            navigationButtons={
              <>
                <Button
                  variant="icon-button"
                  size="icon-sm"
                  onClick={() => startTransition(() => table.previousPage())}
                  disabled={!table.getCanPreviousPage() || isPending}
                >
                  <ChevronLeftIcon pathClasses="stroke-current" />
                </Button>
                <Button
                  variant="icon-button"
                  size="icon-sm"
                  onClick={() => startTransition(() => table.nextPage())}
                  disabled={!table.getCanNextPage() || isPending}
                >
                  <ChevronRightIcon pathClasses="stroke-current" />
                </Button>
              </>
            }
          />
        </DatasetsPaginationLayout>
      )}
    </div>
  );
}
