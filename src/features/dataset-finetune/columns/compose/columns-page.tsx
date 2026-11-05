import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { CheckmarkIcon } from "@/shared/assets/icons/outlined/Checkmark";
import { cn } from "@/shared/lib/css";
import { Badge } from "@/shared/ui/kit/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/kit/table";
import { Text } from "@/shared/ui/kit/text";
import { DatasetFinetuneBackButton } from "../../_compose/dataset-finetune-back-button";
import { DatasetFinetuneContinueButton } from "../../_compose/dataset-finetune-continue-button";
import { FINETUNE_STEP_KEYS } from "../../_lib/finetune-routes";
import { areRequiredRolesFilled } from "../model/are-required-roles-filled";
import {
  FinetuneStepsContent,
  FinetuneStepsContentWrapper,
} from "../../_ui/finetune-steps-layout";
import { useFinetuneColumnsContinue } from "../model/use-finetune-columns-continue";
import { useFinetuneColumnsTable } from "../model/use-finetune-columns-table";

const INSTRUCTION_COLORS = [
  {
    bgColor: "bg-gradient-blue shadow-highlight-blue border-blue-5 [--hairline-color:var(--color-blue-5)]",
    textColor: "text-blue-5",
    borderColor: "var(--color-blue-5)",
  },
  {
    bgColor: "bg-gradient-rose shadow-highlight-rose border-rose-2 [--hairline-color:var(--color-rose-2)]",
    textColor: "text-rose-2",
    borderColor: "var(--color-rose-2)",
  },
  {
    bgColor: "bg-gradient-green shadow-highlight-green border-green-5 [--hairline-color:var(--color-green-5)]",
    textColor: "text-green-5",
    borderColor: "var(--color-green-5)",
  },
  {
    bgColor: "bg-gradient-orange shadow-highlight-orange border-orange-5 [--hairline-color:var(--color-orange-5)]",
    textColor: "text-orange-5",
    borderColor: "var(--color-orange-5)",
  },
  {
    bgColor: "bg-gradient-green shadow-highlight-green border-[#7FB5B3] [--hairline-color:#7FB5B3]",
    textColor: "text-[#7FB5B3]",
    borderColor: "#7FB5B3",
  },
] as const;

// Stable color per training role, keyed by role key (not list position) so a
// role keeps its color regardless of how many buttons the mode shows or what
// order the backend sends them in. Unknown keys fall back to a positional color.
const ROLE_COLOR_BY_KEY: Record<string, (typeof INSTRUCTION_COLORS)[number]> = {
  prompt: INSTRUCTION_COLORS[0],
  completion: INSTRUCTION_COLORS[1],
  chosen: INSTRUCTION_COLORS[2],
  rejected: INSTRUCTION_COLORS[3],
  reasoning_trace: INSTRUCTION_COLORS[4],
};

function roleColor(roleKey: string, fallbackIndex: number) {
  return (
    ROLE_COLOR_BY_KEY[roleKey] ??
    INSTRUCTION_COLORS[fallbackIndex % INSTRUCTION_COLORS.length]!
  );
}

export function ColumnsPage() {
  const { dataset_id } = useParams();
  const {
    headers,
    rows,
    stepKey,
    fields,
    trainingRoleInstructions,
    displayTitleToSlotKey,
    slotKeyToDisplayTitle,
    savedRoleSelections,
    columnInstructions,
  } = useFinetuneColumnsTable();

  // selections: role key → physical Lance column name
  // (e.g. { prompt: "rephrased_prompt", completion: "fused_generation" }).
  // Stored values are real columns, not slot keys — see handleColumnSelect.
  const [selections, setSelections] = useState<Record<string, string | null>>(
    {},
  );
  const [selectedRoleKey, setSelectedRoleKey] = useState<string | null>(null);
  const { submit, isPending } = useFinetuneColumnsContinue();

  useEffect(() => {
    setSelections(savedRoleSelections);
  }, [savedRoleSelections]);

  useEffect(() => {
    if (!trainingRoleInstructions.length) {
      setSelectedRoleKey(null);
      return;
    }
    if (
      selectedRoleKey &&
      trainingRoleInstructions.some((r) => r.key === selectedRoleKey)
    ) {
      return;
    }
    setSelectedRoleKey(trainingRoleInstructions[0]?.key ?? null);
  }, [trainingRoleInstructions, selectedRoleKey]);

  const handleClearRole = (roleKey: string) => {
    setSelections((previous) => ({ ...previous, [roleKey]: null }));
  };

  const handleColumnSelect = (header: string) => {
    if (!selectedRoleKey) return;
    const slotKey = displayTitleToSlotKey[header] ?? header;
    // Resolve slot key to the physical Lance column the backend bound to it
    // for this dataset. When `selectedColumn` is null (slot couldn't resolve),
    // fall through to the slot key itself — works for slots whose key already
    // is a real column (e.g. `original_prompt`) and for raw-column header
    // clicks where `slotKey` is the column name.
    const instruction = columnInstructions.find((ci) => ci.key === slotKey);
    const resolvedColumn = instruction?.selectedColumn ?? slotKey;

    setSelections((previous) => {
      const next = { ...previous };
      for (const [roleKey, mappedColumn] of Object.entries(next)) {
        if (roleKey !== selectedRoleKey && mappedColumn === resolvedColumn) {
          next[roleKey] = null;
        }
      }
      next[selectedRoleKey] = resolvedColumn;
      return next;
    });
  };

  // Reverse lookup: table header → role key that currently maps to it.
  // Stored values are physical columns; map each back to its slot's display
  // title (when the column was selected via a slot) so badges render on the
  // slot table header. Also key by the raw column name to cover raw-column
  // header views.
  const roleByHeader = useMemo(() => {
    const map: Record<string, string> = {};
    for (const [roleKey, column] of Object.entries(selections)) {
      if (!column) continue;
      map[column] = roleKey;
      const slot = columnInstructions.find(
        (ci) => ci.selectedColumn === column || ci.key === column,
      );
      if (slot) {
        map[slot.key] = roleKey;
        map[slot.displayTitle] = roleKey;
      }
      const displayTitle = slotKeyToDisplayTitle[column];
      if (displayTitle && displayTitle !== column) {
        map[displayTitle] = roleKey;
      }
    }
    return map;
  }, [selections, slotKeyToDisplayTitle, columnInstructions]);

  const allRolesFilled = useMemo(
    () => areRequiredRolesFilled(trainingRoleInstructions, selections),
    [trainingRoleInstructions, selections],
  );

  const handleContinue = () => {
    if (!dataset_id || !allRolesFilled) return;
    submit({ datasetId: dataset_id, stepKey, fields, selections });
  };

  return (
    <FinetuneStepsContentWrapper>
      <DatasetFinetuneBackButton stepKey={FINETUNE_STEP_KEYS.columns} />

      <FinetuneStepsContent className="flex h-full min-h-0 flex-col gap-6">
        {trainingRoleInstructions.length > 0 && (
          <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
            {trainingRoleInstructions.map((role, index) => {
              const color = roleColor(role.key, index);
              const hasSelection = Boolean(selections[role.key]);
              const isActive = selectedRoleKey === role.key;

              return (
                <button
                  key={role.key}
                  type="button"
                  onClick={() => setSelectedRoleKey(role.key)}
                  className={cn(
                    "flex min-h-[64px] flex-col items-start gap-1 rounded-[4px] border border-stroke-secondary px-3 py-2 text-left transition-colors",
                    hasSelection && color.bgColor,
                    isActive && "border-1",
                  )}
                  style={
                    isActive ? { borderColor: color.borderColor } : undefined
                  }
                >
                  <Text className="flex items-center gap-1.5">
                    {role.displayTitle}
                  </Text>
                  {hasSelection && (
                    <Text
                      variant="body"
                      className={cn(
                        "flex items-center gap-2 text-[14px] leading-[18px]",
                        color.textColor,
                      )}
                    >
                      <CheckmarkIcon
                        className="size-4"
                        pathClasses="stroke-current"
                      />
                      Selected
                    </Text>
                  )}
                </button>
              );
            })}
          </div>
        )}

        <div className="flex-1 min-h-0">
          {headers.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <Text color="secondary">No columns available yet.</Text>
            </div>
          ) : (
            <div className="flex flex-col h-full overflow-x-auto">
              <Table
                wrapperClassName="flex-1 min-h-0"
                className="table-fixed w-full"
                style={{ minWidth: `${headers.length * 240}px` }}
              >
                <TableHeader>
                  <TableRow>
                    {headers.map((header) => {
                      const roleKey = roleByHeader[header];
                      const mappedRole = trainingRoleInstructions.find(
                        (r) => r.key === roleKey,
                      );
                      const roleIndex = trainingRoleInstructions.findIndex(
                        (r) => r.key === roleKey,
                      );
                      const color =
                        roleKey && roleIndex >= 0
                          ? roleColor(roleKey, roleIndex)
                          : null;

                      return (
                        <TableHead
                          key={header}
                          className="cursor-pointer min-w-[240px]"
                          onClick={() => handleColumnSelect(header)}
                        >
                          <div className="flex flex-col items-start gap-2">
                            <Text className="break-all">{header}</Text>
                            {roleKey && mappedRole ? (
                              <Badge
                                size="md"
                                closable
                                className={cn("w-fit", color?.bgColor)}
                                onClose={() => handleClearRole(roleKey)}
                              >
                                {mappedRole.badgeTitle}
                              </Badge>
                            ) : null}
                          </div>
                        </TableHead>
                      );
                    })}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row, rowIndex) => (
                    <TableRow key={`row-${rowIndex}`}>
                      {headers.map((header) => (
                        <TableCell
                          key={`${rowIndex}-${header}`}
                          className="py-2"
                        >
                          <div className="line-clamp-8">
                            {row[header] ?? ""}
                          </div>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </FinetuneStepsContent>

      <DatasetFinetuneContinueButton
        stepKey={FINETUNE_STEP_KEYS.columns}
        disabled={isPending || !allRolesFilled}
        isLoading={isPending}
        onClick={() => handleContinue()}
      />
    </FinetuneStepsContentWrapper>
  );
}
