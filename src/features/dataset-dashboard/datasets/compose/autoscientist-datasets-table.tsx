import {
  DatasetStatusIndicatorBadge,
  type DatasetStatus,
  useCombineValidate,
  useCombineDatasets,
  type CombineValidationError,
} from "@/services/dataset";
import { ROUTES } from "@/shared/model/routes";
import { cn } from "@/shared/lib/css";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/kit/table";
import { Checkbox } from "@/shared/ui/kit/checkbox";
import { Button } from "@/shared/ui/kit/button";
import { ArrowRightIcon } from "@/shared/assets/icons/outlined/ArrowRight";
import { ChevronLeftIcon } from "@/shared/assets/icons/outlined/ChevronLeft";
import { ChevronRightIcon } from "@/shared/assets/icons/outlined/ChevronRight";
import { flexRender, type ColumnDef } from "@tanstack/react-table";
import { useCallback, useMemo, useState, useTransition } from "react";
import { href, useNavigate } from "react-router-dom";
import {
  useReadyDatasetsTable,
  type ReadyDatasetListRow,
} from "../model/use-ready-datasets-table";
import {
  DatasetsPaginationLayout,
  DatasetsPaginationPage,
  DatasetsPaginationPerPage,
} from "../ui/datasets-pagination";
import { AutoscientistTableEmpty } from "../ui/autoscientist-table-empty";
import { Text } from "@/shared/ui/kit/text";
import {
  appendFinetuneEntryToRoute,
  FINETUNE_ENTRY_POINTS,
  getFinetuneStepsData,
  useStartNewWizardSession,
} from "@/features/dataset-finetune";
import { CombineValidationErrorDialog } from "../ui/combine-validation-error-dialog";
import { CombineNameDialog } from "../ui/combine-name-dialog";
import { CombineProgressOverlay } from "../ui/combine-progress-overlay";
import { buildCombineName } from "../lib/build-combine-name";
import { getApiErrorMessage } from "@/shared/api/api-error";
import { toast } from "@/shared/ui/kit/sonner-toast";
import { DatasetKindBadge } from "../ui/dataset-kind-badge";
import { formatFinetuneWinRatePct } from "../lib/format-finetune-win-rate";

const pageSizeOptions = [
  { label: "5", value: "5" },
  { label: "10", value: "10" },
  { label: "20", value: "20" },
  { label: "30", value: "30" },
];

const MAX_DESCRIPTION_PREVIEW_CHARS = 140;
const COMBINE_VALIDATION_FALLBACK_ERROR =
  "Couldn't combine these datasets. Adjust your selection and try again.";

function formatDescriptionPreview(description: string | null | undefined) {
  if (!description) return "-";
  if (description.length <= MAX_DESCRIPTION_PREVIEW_CHARS) return description;
  return `${description.slice(0, MAX_DESCRIPTION_PREVIEW_CHARS).trim()} [...]`;
}

function navigateToFinetune(
  navigate: ReturnType<typeof useNavigate>,
  datasetId: string,
) {
  const route = appendFinetuneEntryToRoute(
    href(ROUTES.DATASET_FINETUNE, { dataset_id: datasetId }),
    FINETUNE_ENTRY_POINTS.autoscientist,
  );
  navigate(route);
}

export function AutoScientistDatasetsTable() {
  // Workaround for TanStack Table bug with React Compiler
  // https://github.com/shadcn-ui/ui/issues/3905#issuecomment-2692272028
  "use no memo";

  const navigate = useNavigate();
  const [selectedDatasetIds, setSelectedDatasetIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [isContinueLoading, setIsContinueLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    CombineValidationError[] | null
  >(null);
  const [isNameDialogOpen, setIsNameDialogOpen] = useState(false);
  const [pendingCombine, setPendingCombine] = useState<{
    datasetIds: string[];
    defaultName: string;
    totalEstimatedRows: number | null;
  } | null>(null);
  const [isCombineRunning, setIsCombineRunning] = useState(false);

  const { validateCombine, isPending: isValidating } = useCombineValidate();
  const { combineDatasets, isPending: isCombining } = useCombineDatasets();

  const selectionLocked =
    isContinueLoading || isValidating || isCombining || isCombineRunning;

  const handleSelect = useCallback(
    (datasetId: string, checked: boolean) => {
      if (selectionLocked) return;
      setSelectedDatasetIds((prev) => {
        const next = new Set(prev);
        if (checked) {
          next.add(datasetId);
        } else {
          next.delete(datasetId);
        }
        return next;
      });
    },
    [selectionLocked],
  );

  const { startNewSession } = useStartNewWizardSession();

  const columns = useMemo<ColumnDef<ReadyDatasetListRow>[]>(() => {
    return [
      {
        id: "select",
        header: "",
        cell: (props) => {
          const datasetId = props.row.original.dataset_id;
          const isChecked = selectedDatasetIds.has(datasetId);

          return (
            <Checkbox
              checked={isChecked}
              onCheckedChange={(checked) =>
                handleSelect(datasetId, checked === true)
              }
              disabled={selectionLocked}
              className={cn(selectionLocked && "opacity-40")}
              aria-label={`Select dataset ${props.row.original.name ?? datasetId}`}
            />
          );
        },
      },
      {
        accessorKey: "name",
        header: "NAME",
      },
      {
        accessorKey: "kind",
        header: "TYPE",
        cell: (props) => (
          <DatasetKindBadge
            kind={props.getValue() as ReadyDatasetListRow["kind"]}
          />
        ),
      },
      {
        accessorKey: "metadata.dataset_description",
        header: "DESCRIPTION",
        cell: (props) => {
          const description = props.getValue() as string | null | undefined;
          const preview = formatDescriptionPreview(description);

          return (
            <span
              className="line-clamp-2 whitespace-normal"
              title={description ?? "-"}
            >
              {preview}
            </span>
          );
        },
      },
      {
        accessorKey: "created_at",
        header: "DATE",
        cell: (props) => {
          const date = new Date(props.getValue() as string);
          const tooltip = date.toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            timeZoneName: "short",
          });
          return <span title={tooltip}>{date.toLocaleDateString()}</span>;
        },
      },
      {
        accessorKey: "processed_rows",
        header: "DATA SIZE",
        cell: (props) => {
          const processedRows = props?.getValue() as number | null;
          return (
            <span>
              {processedRows != null ? processedRows.toLocaleString() : "-"}
            </span>
          );
        },
      },
      {
        accessorKey: "status",
        header: "STATUS",
        cell: (props) => {
          return (
            <DatasetStatusIndicatorBadge
              state={props.getValue() as DatasetStatus}
            />
          );
        },
      },
      {
        id: "win_rate",
        header: "WIN RATE",
        cell: (props) =>
          formatFinetuneWinRatePct(
            props.row.original.latest_finetune?.win_rates,
          ),
      },
    ];
  }, [handleSelect, selectedDatasetIds, selectionLocked]);

  const { table, pageOptions, isEmpty, showPagination } = useReadyDatasetsTable(
    {
      columns,
    },
  );
  const [isPending, startTransition] = useTransition();

  const handleSingleContinue = useCallback(
    async (datasetId: string) => {
      setIsContinueLoading(true);
      // Continue from the AutoScientist picker is an explicit "start a
      // new run" intent — mint a fresh wizard session so the previous
      // attempt's slider values and completed-step marks don't bleed
      // into this attempt (and trigger a silent re-charge by skipping
      // past the augmentation screen). Fail loud on mint failure rather
      // than navigate anyway: navigating to a wizard that still has the
      // old session open would re-trigger the very bug this is fixing.
      try {
        await startNewSession(datasetId);
      } catch (err) {
        toast.error(
          getApiErrorMessage(
            err,
            "Couldn't start a new AutoScientist run. Please try again.",
          ),
        );
        setIsContinueLoading(false);
        return;
      }
      try {
        await getFinetuneStepsData(datasetId);
      } catch {
        // Allow navigation even if prefetch fails; finetune route has its
        // own loader that will surface a fresh error if applicable.
      }
      navigateToFinetune(navigate, datasetId);
    },
    [navigate, startNewSession],
  );

  const handleMultiContinue = useCallback(
    async (datasetIds: string[]) => {
      try {
        const result = await validateCombine(datasetIds);

        if (!result.compatible) {
          const errors = result.errors ?? [];
          if (errors.length === 0) {
            toast.error(COMBINE_VALIDATION_FALLBACK_ERROR);
            return;
          }
          setValidationErrors(errors);
          return;
        }

        const rowsById = new Map(
          table
            .getRowModel()
            .rows.map((row) => [row.original.dataset_id, row.original]),
        );
        const orderedNames = datasetIds.map(
          (id) => rowsById.get(id)?.name ?? "",
        );

        setPendingCombine({
          datasetIds,
          defaultName: buildCombineName(orderedNames),
          totalEstimatedRows: result.total_estimated_rows,
        });
        setIsNameDialogOpen(true);
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Could not validate datasets."));
      }
    },
    [table, validateCombine],
  );

  const handleContinue = useCallback(async () => {
    if (selectionLocked || selectedDatasetIds.size === 0) return;

    const datasetIds = Array.from(selectedDatasetIds);
    const [firstDatasetId] = datasetIds;

    if (datasetIds.length === 1 && firstDatasetId) {
      await handleSingleContinue(firstDatasetId);
      return;
    }

    await handleMultiContinue(datasetIds);
  }, [
    selectionLocked,
    selectedDatasetIds,
    handleSingleContinue,
    handleMultiContinue,
  ]);

  const handleNameDialogChange = (open: boolean) => {
    if (isCombining || isCombineRunning) return;
    setIsNameDialogOpen(open);
    if (!open) setPendingCombine(null);
  };

  const handleNameConfirm = useCallback(
    async (name: string) => {
      if (!pendingCombine) return;
      setIsCombineRunning(true);
      try {
        const { dataset_id: mergedId } = await combineDatasets({
          dataset_ids: pendingCombine.datasetIds,
          name,
        });
        setIsNameDialogOpen(false);
        setPendingCombine(null);
        try {
          await getFinetuneStepsData(mergedId);
        } catch {
          // Same as single path: navigate even if the prefetch trips.
        }
        navigateToFinetune(navigate, mergedId);
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Could not combine datasets."));
        setIsCombineRunning(false);
      }
    },
    [combineDatasets, navigate, pendingCombine],
  );

  if (isEmpty) {
    return <AutoscientistTableEmpty />;
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <Text variant="h1" className="text-center">
        What dataset do you want to apply AutoScientist to?
      </Text>
      <div className="mt-6 flex h-full w-full min-h-0 flex-col overflow-hidden">
        <Table
          wrapperClassName="flex-1 min-h-0"
          className={cn(
            "w-full",
            isPending && "opacity-50",
            selectionLocked && "pointer-events-none",
          )}
        >
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.original.dataset_id}
                data-state={
                  selectedDatasetIds.has(row.original.dataset_id)
                    ? "selected"
                    : undefined
                }
              >
                {row.getAllCells().map((cell) => (
                  <TableCell key={cell.id} className="whitespace-normal py-4">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {showPagination && (
          <DatasetsPaginationLayout>
            <DatasetsPaginationPerPage
              pageSize={table.getState().pagination.pageSize}
              onPageSizeChange={(value) =>
                startTransition(() => {
                  const pageSize = Number(value);
                  if (!Number.isFinite(pageSize) || pageSize <= 0) return;
                  table.setPagination((prev) => ({
                    ...prev,
                    pageIndex: 0,
                    pageSize,
                  }));
                })
              }
              disabled={isPending}
              options={pageSizeOptions}
            />
            <DatasetsPaginationPage
              currentPage={table.getState().pagination.pageIndex + 1}
              onCurrentPageChange={(value) =>
                startTransition(() => {
                  const pageIndex = Number(value) - 1;
                  if (!Number.isFinite(pageIndex) || pageIndex < 0) return;
                  table.setPagination((prev) => ({ ...prev, pageIndex }));
                })
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

        <div className="flex justify-end pb-6">
          <Button
            variant="primary"
            onClick={() => handleContinue()}
            disabled={selectedDatasetIds.size === 0 || selectionLocked}
            isLoading={isContinueLoading || isValidating}
          >
            Continue <ArrowRightIcon pathClasses="stroke-current" />
          </Button>
        </div>
      </div>

      {validationErrors && validationErrors.length > 0 && (
        <CombineValidationErrorDialog
          open
          onOpenChange={(open) => {
            if (!open) setValidationErrors(null);
          }}
          errors={validationErrors}
        />
      )}

      <CombineNameDialog
        open={isNameDialogOpen}
        onOpenChange={handleNameDialogChange}
        defaultName={pendingCombine?.defaultName ?? ""}
        totalEstimatedRows={pendingCombine?.totalEstimatedRows ?? null}
        isSubmitting={isCombining || isCombineRunning}
        onSubmit={handleNameConfirm}
      />

      <CombineProgressOverlay open={isCombineRunning} />
    </div>
  );
}
