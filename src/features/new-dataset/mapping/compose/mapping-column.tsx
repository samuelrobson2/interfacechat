import { cn } from "@/shared/lib/css";
import { Checkbox } from "@/shared/ui/kit/checkbox";
import { Label } from "@/shared/ui/kit/label";
import { Switch } from "@/shared/ui/kit/switch";
import { MappingItem } from "../ui/mapping-item";
import type {
  ColumnActions,
  ColumnConfig,
  ContextColumnActions,
  ContextColumnConfig,
  PromptColumnState,
} from "../model/mapping-store";
import { Separator } from "@/shared/ui/kit/separator";
import { Text } from "@/shared/ui/kit/text";
import { ArrowRightIcon } from "@/shared/assets/icons/outlined/ArrowRight";

type ColumnState =
  | PromptColumnState
  | (ColumnConfig & ColumnActions)
  | (ContextColumnConfig & ContextColumnActions)
  | (Omit<ColumnConfig, "createColumn"> & Omit<ColumnActions, "setCreate">);

export const MappingColumn = ({
  id,
  title,
  tooltipContent,
  className,
  disabledItem,
  disabledInputs,
  disabledHasNoColumn,
  isSelected,
  bgSelectedColor,
  textSelectedColor,
  columnState,
  onColumnSelect,
}: React.ComponentProps<typeof MappingItem> & {
  id: string;
  disabledItem?: boolean;
  disabledInputs?: boolean;
  disabledHasNoColumn?: boolean;
  bgSelectedColor: string;
  isSelected: boolean;
  columnState: ColumnState;
}) => {
  const checkboxId = `${id}-checkbox`;
  const switchId = `${id}-switch`;
  const checkboxLabel = `I don't have ${id}`;
  const switchLabel =
    id === "prompt" ? `Let adaption create prompt` : `Create ${id}`;

  // Check if column has create functionality (only for single column states)
  const hasCreateSwitch =
    "setCreate" in columnState && columnState.setCreate !== undefined;
  const promptColumn =
    "setShowUniversalPrompt" in columnState ? columnState : null;
  const disableHasNoWhileUniversalSet =
    id === "prompt" && Boolean(promptColumn?.universalPrompt.trim());

  return (
    <div className="flex flex-col gap-3">
      <MappingItem
        className={cn(className, isSelected && bgSelectedColor)}
        disabled={disabledItem}
        selectedColumn={
          Array.isArray(columnState.column)
            ? columnState.column.length > 0
            : !!columnState.column
        }
        textSelectedColor={textSelectedColor}
        title={title}
        tooltipContent={tooltipContent}
        onColumnSelect={onColumnSelect}
      />

      {(!columnState.column || columnState.column.length === 0) && (
        <div className="flex flex-col gap-[30px]">
          <Label
            className="px-4"
            htmlFor={checkboxId}
            disabled={
              disabledInputs ||
              disabledHasNoColumn ||
              disableHasNoWhileUniversalSet
            }
            onClick={(e) => e.stopPropagation()}
          >
            <Checkbox
              id={checkboxId}
              disabled={
                disabledInputs ||
                disabledHasNoColumn ||
                disableHasNoWhileUniversalSet
              }
              checked={columnState.hasNoColumn}
              onCheckedChange={columnState.setHasNo}
            />
            {checkboxLabel}
          </Label>

          {hasCreateSwitch && columnState.hasNoColumn && (
            <div className="flex flex-col gap-3 px-4">
              <Label
                htmlFor={switchId}
                disabled={disabledInputs}
                onClick={(e) => e.stopPropagation()}
              >
                <Switch
                  id={switchId}
                  disabled={
                    disabledInputs ||
                    !!(promptColumn && promptColumn.universalPrompt)
                  }
                  checked={columnState.createColumn}
                  onCheckedChange={columnState.setCreate}
                />
                {switchLabel}
              </Label>
              {promptColumn && !columnState.createColumn && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <Separator className="flex-1" />
                    <Text variant="label">OR</Text>
                    <Separator className="flex-1" />
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      promptColumn.setShowUniversalPrompt(
                        !promptColumn.showUniversalPrompt,
                      )
                    }
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Text variant="body">Write universal prompt</Text>
                    <ArrowRightIcon width={20} height={20} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
