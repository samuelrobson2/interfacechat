import { ChevronBottomIcon } from "@/shared/assets/icons/outlined/ChevronBottom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/ui/kit/accordion";
import { Separator } from "@/shared/ui/kit/separator";
import { Text } from "@/shared/ui/kit/text";
import { DatasetInfoEditableItem } from "@/services/dataset";
import { useState } from "react";
import { NewDatasetBackButton } from "../../_compose/new-dataset-back-button";
import { NewDatasetContinueButton } from "../../_compose/new-dataset-continue-button";
import { NEW_DATASET_KEYS } from "../../_lib/new-dataset-routes";
import { useDatasetStepSuspenseQuery } from "../../_model/use-dataset-step-query";
import {
  NewDatasetStepsContent,
  NewDatasetStepsContentWrapper,
} from "../../_ui/new-dataset-steps-layout";
import {
  MappingProvider,
  useIsMappingValid,
  useMappingContext,
} from "../model/mapping-store";
import { useMappingParsedValues } from "../model/use-mapping-parsed-values";
import { useMappingPost } from "../model/use-mapping-post";
import { useMappingSuspenseData } from "../model/use-mapping-suspense-data";
import {
  CHAT_WITH_CONTEXT_IMAGES_ONLY_TOAST,
  colorsMap,
  IMAGE_DOCS_TOAST_OPTIONS,
  useMappingTable,
} from "../model/use-mapping-table";
import { MappingTable } from "../ui/mapping-table";
import { MappingColumn } from "./mapping-column";
import { toast } from "@/shared/ui/kit/sonner-toast";

export function MappingPage() {
  useMappingSuspenseData();
  const { prompt, context, completion, chat, selectedColumn } =
    useMappingParsedValues();

  return (
    <MappingProvider
      prompt={prompt}
      context={context}
      completion={completion}
      chat={chat}
      selectedColumn={selectedColumn}
    >
      <MappingConsumer />
    </MappingProvider>
  );
}

function MappingConsumer() {
  const { submitForm, isPending } = useMappingPost();
  const isMappingValid = useIsMappingValid();
  const prompt = useMappingContext((state) => state.prompt);
  const context = useMappingContext((state) => state.context);
  const completion = useMappingContext((state) => state.completion);
  const chat = useMappingContext((state) => state.chat);
  const selectedColumn = useMappingContext((state) => state.selectedColumn);
  const setSelectedColumn = useMappingContext(
    (state) => state.setSelectedColumn,
  );
  const [accordionState, setAccordionState] = useState<"chat" | undefined>(
    chat.column ? "chat" : undefined,
  );

  const {
    columns,
    tableData,
    handleColumnSelect,
    handleColumnRemove,
    selectedColumns,
    imageColumnId,
    hasInvalidChatWithContext,
  } = useMappingTable();
  const questionnaire = useDatasetStepSuspenseQuery(
    NEW_DATASET_KEYS.questionnaire,
  );
  const trainingDatasetType =
    questionnaire.data.step.fields?.training_dataset_type?.response_values?.[0]
      ?.value;

  const allowsChatWithContextImages = !!imageColumnId;
  const hasNonImageContextColumns = context.column.some(
    (col) => col !== imageColumnId,
  );
  const isContextDisabledByChat = !!chat.column && !allowsChatWithContextImages;
  const isChatDisabled =
    !!prompt.column ||
    !!completion.column ||
    (allowsChatWithContextImages
      ? hasNonImageContextColumns
      : context.column.length > 0);

  const showUniversalPromptField =
    !prompt.column &&
    prompt.hasNoColumn &&
    !prompt.createColumn &&
    (prompt.showUniversalPrompt || !!prompt.universalPrompt.trim());

  return (
    <NewDatasetStepsContentWrapper>
      <NewDatasetBackButton stepKey={NEW_DATASET_KEYS.mapping} />

      <NewDatasetStepsContent className="flex flex-col gap-6 overflow-y-hidden">
        <div className="overflow-y-auto no-scrollbar">
          <div className="grid grid-cols-3 gap-x-4 gap-y-6 items-baseline shrink-0 min-w-0">
            <MappingColumn
              id="prompt"
              title="Prompt column"
              tooltipContent="The column which contains the question, instruction, or task that needs to be completed."
              className="min-w-0 w-full"
              disabledItem={!!chat.column || prompt.hasNoColumn}
              disabledInputs={!!chat.column}
              disabledHasNoColumn={completion.hasNoColumn}
              isSelected={selectedColumn === "prompt"}
              bgSelectedColor={colorsMap.prompt.bgColor}
              textSelectedColor={colorsMap.prompt.textColor}
              columnState={prompt}
              onColumnSelect={() => setSelectedColumn("prompt")}
            />

            <MappingColumn
              id="context"
              title="Context column"
              tooltipContent="Column(s) containing background information, reference material, or documents needed to answer the questions in the prompt column. There may be multiple context columns."
              className="min-w-0 w-full"
              disabledItem={isContextDisabledByChat || context.hasNoColumn}
              disabledInputs={isContextDisabledByChat}
              isSelected={selectedColumn === "context"}
              bgSelectedColor={colorsMap.context.bgColor}
              textSelectedColor={colorsMap.context.textColor}
              columnState={context}
              onColumnSelect={() => setSelectedColumn("context")}
            />

            <MappingColumn
              id="completion"
              title="Completion column"
              tooltipContent="Column containing the expected responses or answers to the prompt column."
              className="min-w-0 w-full"
              disabledItem={!!chat.column || completion.hasNoColumn}
              disabledInputs={!!chat.column}
              disabledHasNoColumn={
                prompt.hasNoColumn && !prompt.universalPrompt
              }
              isSelected={selectedColumn === "completion"}
              bgSelectedColor={colorsMap.completion.bgColor}
              textSelectedColor={colorsMap.completion.textColor}
              columnState={completion}
              onColumnSelect={() => setSelectedColumn("completion")}
            />

            {showUniversalPromptField && (
              <div className="col-span-3 w-full min-w-0 px-4">
                <DatasetInfoEditableItem
                  value={prompt.universalPrompt}
                  onSubmit={(value) => prompt.setUniversalPrompt(value)}
                  maxTextLines={4}
                  inputType="textarea"
                  name="universal_prompt"
                  placeholder="Enter prompt for all entries..."
                  expanded
                  autoSave
                  autoSaveDebounceMs={700}
                  className="w-full"
                />
              </div>
            )}

            <Accordion
              value={accordionState}
              onValueChange={(value) =>
                setAccordionState(value as "chat" | undefined)
              }
              type="single"
              collapsible
              className="col-span-3"
            >
              <AccordionItem className="flex flex-col gap-6" value="chat">
                <AccordionTrigger
                  className="items-center cursor-pointer py-0"
                  showIcon={false}
                >
                  <Separator className="flex-1" />
                  <div className="flex items-center gap-3">
                    <Text variant="title">OR</Text>
                    <ChevronBottomIcon className="transition-transform" />
                  </div>
                  <Separator className="flex-1" />
                </AccordionTrigger>
                <AccordionContent className="grid grid-cols-3 gap-4 p-0">
                  <MappingColumn
                    id="chat"
                    title="Chat column"
                    tooltipContent="A column containing multi-turn conversational exchanges or dialogue history."
                    disabledItem={isChatDisabled || chat.hasNoColumn}
                    disabledInputs={isChatDisabled}
                    isSelected={selectedColumn === "chat"}
                    bgSelectedColor={colorsMap.chat.bgColor}
                    textSelectedColor={colorsMap.chat.textColor}
                    columnState={chat}
                    onColumnSelect={() => setSelectedColumn("chat")}
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <div className="flex flex-col gap-4 flex-1 min-h-0">
            <Text>Choose which columns correspond to your prompt</Text>

            <MappingTable
              className="flex-1 min-h-0"
              columns={columns}
              data={tableData}
              selectedColumns={selectedColumns}
              imageColumnId={imageColumnId}
              borderHoverColor={
                colorsMap[selectedColumn as keyof typeof colorsMap]
                  ?.borderColor || ""
              }
              onColumnSelect={handleColumnSelect}
              onColumnRemove={handleColumnRemove}
            />
          </div>
        </div>
      </NewDatasetStepsContent>

      <NewDatasetContinueButton
        stepKey={NEW_DATASET_KEYS.mapping}
        disabled={!isMappingValid}
        isLoading={isPending}
        onClick={() => {
          if (hasInvalidChatWithContext) {
            toast.error(
              CHAT_WITH_CONTEXT_IMAGES_ONLY_TOAST,
              IMAGE_DOCS_TOAST_OPTIONS,
            );
            return;
          }

          if (
            trainingDatasetType === "preference_pairs" &&
            !!imageColumnId &&
            context.column.includes(imageColumnId)
          ) {
            toast.error(
              "Images are not allowed in Preference pairs datasets",
              IMAGE_DOCS_TOAST_OPTIONS,
            );
            return;
          }

          if (
            isMappingValid &&
            prompt.universalPrompt &&
            context.column.length === 0
          ) {
            toast.error(
              "You must choose context column(s) when you set universal prompt",
            );
          } else {
            submitForm();
          }
        }}
      />
    </NewDatasetStepsContentWrapper>
  );
}
