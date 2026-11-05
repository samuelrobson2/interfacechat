import { useState } from "react";
import {
  BreadcrumbTrail,
  type BreadcrumbTrailItem,
  ChatDatasetPickerHeader,
  ChatDatasetPickerItem,
  ChatDatasetPickerPanel,
  ChatInterfaceSkeleton,
  DatasetSwitchChip,
  DatasetSwitchPanel,
  type DatasetSwitchOption,
  DatasetSwitchTrigger,
  type ConnectionAction,
  type ConnectionItem,
  ConnectionsMenu,
  FloatingWindow,
  type InterfacePickerItem,
  InterfacePickerMenu,
  PublishMenu,
  ToolbarButton,
  VersionHistoryMenu,
  versionHistoryMock,
} from "@/shared/ui/kit-additions";
import {
  CustomFollowupTextarea,
  FollowupBackButton,
  FollowupSuggestionButton,
} from "@/features/chat/suggestions/ui/chat-followup-suggestions";
import {
  ChatComposerSendButton,
  ChatInlineComposer,
  ChatSuggestionCard,
} from "@/services/chat";
import { ArrowRightIcon } from "@/shared/assets/icons/outlined/ArrowRight";
import { ArrowUpIcon } from "@/shared/assets/icons/outlined/ArrowUp";
import { PlusSmallIcon } from "@/shared/assets/icons/outlined/PlusSmall";
import { Boxes, Database, Paperclip } from "lucide-react";
import { cn } from "@/shared/lib/css";
import { FullScreenIcon } from "@/shared/assets/icons/general/FullScreen";
import { HistoryIcon } from "@/shared/assets/icons/general/History";
import { RedoIcon } from "@/shared/assets/icons/general/Redo";
import { UndoIcon } from "@/shared/assets/icons/general/Undo";
import { Text } from "@/shared/ui/kit/text";
import { GalleryPage, Section, Specimen } from "../ui-kit-parts";

// Additions — components built in THIS app that don't exist in pharos: the
// interface-editor chrome, the highlight-tool edit-suggestions popover, and the
// draggable interface window. (Pharos composites — chat composers, frames,
// suggestion cards, the save flow — live under the "Components" tab.)

// Stand-in saved interfaces for the picker specimen — the shape the editor passes
// it, with one already open so both meta styles are visible.
const INTERFACE_PICKER_MOCK: InterfacePickerItem[] = [
  {
    id: "conservation",
    title: "Conservation Programs Assistant",
    meta: "Open",
  },
  { id: "eligibility", title: "Eligibility Review Queue", meta: "Yesterday" },
  { id: "forest", title: "Forest Thinning Eligibility", meta: "3 days ago" },
];

// Stand-in connections for the specimen — the same shape the editor's
// Connections button passes in.
const CONNECTIONS_MOCK: ConnectionItem[] = [
  {
    id: "dataset",
    icon: Database,
    label: "Conservation Programs",
    kind: "Dataset",
  },
  { id: "model", icon: Boxes, label: "Llama 3 8B · SFT", kind: "Model" },
  {
    id: "attachment",
    icon: Paperclip,
    label: "drought-designations.csv",
    kind: "Attachment",
  },
];
const CONNECTIONS_ACTIONS_MOCK: ConnectionAction[] = [
  { id: "data", icon: Database, label: "Connect data" },
  { id: "model", icon: Boxes, label: "Connect a model" },
  { id: "file", icon: Paperclip, label: "Add an attachment" },
];

const MOCK_EDITS = [
  "Make the page heading larger and bolder",
  "Use the green accent for the active topic",
  "Add a short summary card at the top",
];

/** The edit-suggestions popover shown when an element is picked with the
 *  highlight tool: a list of suggested edits that flips to a free-form
 *  "describe the change" textarea via "Ask something else". */
function EditSuggestionsDemo() {
  const [custom, setCustom] = useState(false);
  const [text, setText] = useState("");
  return (
    <div className="flex w-[280px] max-w-full flex-col items-start gap-2">
      {custom ? (
        <>
          <FollowupBackButton
            aria-label="Back to edit suggestions"
            onClick={() => {
              setCustom(false);
              setText("");
            }}
          />
          <CustomFollowupTextarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            placeholder="Describe the change"
            actions={
              <button
                type="button"
                disabled={!text.trim()}
                aria-label="Submit edit"
                className={cn(
                  "inline-flex size-4 cursor-pointer items-center justify-center transition-opacity",
                  !text.trim() && "cursor-not-allowed opacity-50",
                )}
              >
                <ArrowUpIcon svgClasses="size-4" />
              </button>
            }
          />
        </>
      ) : (
        <>
          {MOCK_EDITS.map((s) => (
            <FollowupSuggestionButton
              key={s}
              label={s}
              hideEndIconUntilHover
              endIcon={<ArrowRightIcon svgClasses="size-4" />}
              onClick={() => {}}
            />
          ))}
          <FollowupSuggestionButton
            label="Ask something else"
            endIcon={<PlusSmallIcon svgClasses="size-3" />}
            onClick={() => setCustom(true)}
          />
        </>
      )}
    </div>
  );
}

function ToolbarDemo() {
  const [tool, setTool] = useState("select");
  return (
    // A gradient backdrop so the buttons' frosted-glass fill (translucent +
    // backdrop-blur) is actually visible — same treatment as the live toolbar.
    <div className="flex w-full items-center justify-center rounded-[14px] bg-[linear-gradient(120deg,#DAA7D2_0%,#A9BAD1_52%,#4986B4_100%)] p-6">
      <div className="flex items-center gap-1 rounded-[22px] bg-white/45 p-1.5 shadow-[0_10px_30px_-14px_rgba(20,18,30,0.4)] backdrop-blur-xl backdrop-saturate-150 hairline [--hairline-color:var(--color-gray-3)] [--hairline-opacity:0.35] [--hairline-radius:22px]">
        <ToolbarButton
          icon={<UndoIcon svgClasses="size-4" />}
          label="Undo"
          expanded={false}
        />
        <ToolbarButton
          icon={<RedoIcon svgClasses="size-4" />}
          label="Redo"
          expanded={false}
        />
        <ToolbarButton
          icon={<HistoryIcon svgClasses="size-4" />}
          label="History"
          active={tool === "history"}
          expanded
          onClick={() => setTool("history")}
        />
        <ToolbarButton
          icon={<FullScreenIcon svgClasses="size-4" />}
          label="Expand"
          active={tool === "expand"}
          expanded
          onClick={() => setTool("expand")}
        />
      </div>
    </div>
  );
}

const MOCK_DATASETS = [
  "Ultrachat Dataset 1",
  "legal_multichoice_qa",
  "ev-charging-and-grid-optimization-data",
];

const MOCK_SWITCH_DATASETS: DatasetSwitchOption[] = MOCK_DATASETS.map(
  (label, i) => ({ id: `dataset-${i}`, label }),
);

// Deep enough to fold — hovering the trail expands the hidden middle back out.
const MOCK_TRAIL: BreadcrumbTrailItem[] = [
  { id: "dataset", label: "function_calling_and_tool_use", to: "/datasets" },
  { id: "finetune", label: "Fine-tune", to: "/datasets" },
  { id: "columns", label: "Columns", to: "/datasets" },
  { id: "augmentation", label: "Augmentation", to: "/datasets" },
  { id: "current", label: "Hyperparameters" },
];

/** The trail folded and expanded, plus the change animation on a crumb's label. */
function BreadcrumbTrailDemo() {
  const [datasetIndex, setDatasetIndex] = useState(0);
  const swapped = MOCK_TRAIL.map((crumb) =>
    crumb.id === "dataset"
      ? { ...crumb, label: MOCK_DATASETS[datasetIndex]! }
      : crumb,
  );

  return (
    <div className="flex w-full flex-col gap-4 rounded-[12px] bg-background-secondary p-6">
      {/* The trail as a page title — the size the dataset dashboard uses. */}
      <BreadcrumbTrail size="title" items={MOCK_TRAIL.slice(0, 1)} />
      <BreadcrumbTrail items={MOCK_TRAIL.slice(-2)} />
      {/* Folded — hover to expand the hidden crumbs. */}
      <BreadcrumbTrail items={swapped} />
      <button
        type="button"
        className="w-fit cursor-pointer rounded-[10px] bg-gray-1 px-3 py-1.5 hairline [--hairline-radius:10px]"
        onClick={() =>
          setDatasetIndex((i) => (i + 1) % MOCK_DATASETS.length)
        }
      >
        <Text variant="label">Change the dataset crumb</Text>
      </button>
    </div>
  );
}

/** The composer's dataset switch: paperclip + chip in the action row, panel below. */
function DatasetSwitchDemo() {
  const [activeId, setActiveId] = useState(MOCK_SWITCH_DATASETS[0]!.id);
  const [open, setOpen] = useState(true);
  const active = MOCK_SWITCH_DATASETS.find((d) => d.id === activeId);

  return (
    <div className="flex w-[520px] max-w-full flex-col">
      {/* Stands in for the composer: the panel slides out from under it. */}
      <div className="relative z-10 flex items-center gap-1.5 rounded-[16px] border-[0.5px] border-gray-2 bg-gray-0 p-3">
        <DatasetSwitchTrigger open={open} onClick={() => setOpen((o) => !o)} />
        {active && (
          <DatasetSwitchChip
            label={active.label}
            onClick={() => setOpen((o) => !o)}
          />
        )}
      </div>
      <DatasetSwitchPanel
        open={open}
        options={MOCK_SWITCH_DATASETS}
        activeId={activeId}
        onSelect={(option) => setActiveId(option.id)}
      />
    </div>
  );
}

const MOCK_FOR_YOU = [
  "Suggestion can go here. Lorem Ipsum dolor sit amet consectetur.",
  "Suggestion can go here. Lorem Ipsum dolor sit amet consectetur.",
  "Suggestion can go here. Lorem Ipsum dolor sit amet consectetur.",
];

/** The "Add an AutoScientist" dataset picker that expands above the chat
 *  composer — a back-nav header over a list of attachable datasets, each
 *  row revealing an add action on hover. */
function DatasetPickerDemo() {
  const [added, setAdded] = useState<string | null>(null);
  return (
    <div className="flex w-[380px] max-w-full flex-col items-start gap-2">
      <ChatDatasetPickerHeader label="Add an AutoScientist" onClick={() => {}} />
      <ChatDatasetPickerPanel>
        {MOCK_DATASETS.map((name, i) => (
          <ChatDatasetPickerItem
            key={name}
            label={name}
            active={added === name || i === 0}
            onAdd={() => setAdded(name)}
          />
        ))}
      </ChatDatasetPickerPanel>
    </div>
  );
}

/** The full "AI / Input / Chat" composite: the flat 660×100 composer bar (a
 *  hairline-bordered, drop-shadowed ChatInlineComposer rather than the app's
 *  usual frosted-glass frame), the AutoScientist dataset picker beneath it,
 *  and the "For you" suggestion row. */
function ChatComposerCompositeDemo() {
  const [value, setValue] = useState("");
  const [added, setAdded] = useState<string | null>(null);

  return (
    <div className="flex w-[660px] max-w-full flex-col items-start gap-6">
      <ChatInlineComposer
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="How can we help you?"
        frameThickness={0.5}
        blurAmount={0}
        fillClassName="bg-gray-2"
        frameClassName="h-[100px] w-full shadow-[0_4px_6px_rgba(26,23,24,0.15)]"
        rightActions={
          <ChatComposerSendButton
            active={value.trim().length > 0}
            disabled={!value.trim()}
          />
        }
      />

      <div className="flex w-full flex-col items-start gap-2">
        <ChatDatasetPickerHeader label="Add an AutoScientist" onClick={() => {}} />
        <ChatDatasetPickerPanel>
          {MOCK_DATASETS.map((name, i) => (
            <ChatDatasetPickerItem
              key={name}
              label={name}
              active={added === name || i === 0}
              onAdd={() => setAdded(name)}
            />
          ))}
        </ChatDatasetPickerPanel>
      </div>

      <div className="flex w-full flex-col items-center gap-3">
        <Text variant="label" color="secondary">
          For you
        </Text>
        <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-3">
          {MOCK_FOR_YOU.map((suggestion, i) => (
            <ChatSuggestionCard
              key={i}
              variant="plain"
              suggestion={suggestion}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function WindowDemo() {
  return (
    <div className="relative h-[360px] w-full overflow-hidden rounded-[12px] bg-background-secondary">
      <FloatingWindow initial={{ x: 32, y: 28, w: 360, h: 240 }} minW={260} minH={160}>
        {(move) => (
          <div className="flex h-full w-full flex-col overflow-hidden rounded-[12px] bg-background-primary shadow-[0_24px_60px_-20px_rgba(20,18,30,0.25)] hairline [--hairline-radius:12px]">
            <div
              {...move}
              className="flex h-9 shrink-0 cursor-grab items-center border-b border-stroke-secondary px-3 active:cursor-grabbing"
            >
              <Text variant="label" color="secondary">
                Drag me · resize from any edge
              </Text>
            </div>
            <div className="flex flex-1 items-center justify-center p-4">
              <Text variant="label" color="secondary">
                Window body
              </Text>
            </div>
          </div>
        )}
      </FloatingWindow>
    </div>
  );
}

function AdditionsPage() {
  return (
    <GalleryPage>
      <Text variant="body" color="secondary">
        Components built in this app that don’t exist in pharos — the
        interface-editor chrome from{" "}
        <span className="font-bureau">@/shared/ui/kit-additions</span> and the
        highlight-tool suggestions from{" "}
        <span className="font-bureau">
          @/features/chat/suggestions
        </span>
        . Pharos composites live under the <span className="font-bureau">Components</span> tab.
      </Text>

      {/* Interface editor chrome */}
      <Section title="Interface editor chrome">
        <Specimen name="ToolbarButton" from="@/shared/ui/kit-additions">
          <ToolbarDemo />
        </Specimen>
        <Specimen name="VersionHistoryMenu" from="@/shared/ui/kit-additions" span>
          <VersionHistoryMenu entries={versionHistoryMock} />
        </Specimen>
        <Specimen name="InterfacePickerMenu" from="@/shared/ui/kit-additions" span>
          <div className="flex w-full justify-center rounded-[12px] bg-background-secondary p-6">
            <InterfacePickerMenu items={INTERFACE_PICKER_MOCK} />
          </div>
        </Specimen>
        <Specimen name="ConnectionsMenu" from="@/shared/ui/kit-additions" span>
          <div className="flex w-full justify-center rounded-[12px] bg-background-secondary p-6">
            <ConnectionsMenu
              items={CONNECTIONS_MOCK}
              actions={CONNECTIONS_ACTIONS_MOCK}
            />
          </div>
        </Specimen>
        <Specimen name="ChatInterfaceSkeleton" from="@/shared/ui/kit-additions" span>
          <div className="h-[280px] w-full rounded-[12px] bg-background-secondary p-4">
            <ChatInterfaceSkeleton />
          </div>
        </Specimen>
        <Specimen name="PublishMenu" from="@/shared/ui/kit-additions" span>
          <div className="flex h-[420px] w-full items-start justify-center rounded-[12px] bg-background-secondary p-6">
            <PublishMenu />
          </div>
        </Specimen>
      </Section>

      {/* Navigation */}
      <Section title="Navigation">
        <Specimen
          name="BreadcrumbTrail + ChangingText"
          copy="BreadcrumbTrailDemo"
          from="@/shared/ui/kit-additions"
          span
        >
          <BreadcrumbTrailDemo />
        </Specimen>
      </Section>

      {/* Composer dataset switch */}
      <Section title="Dataset switch">
        <Specimen
          name="DatasetSwitchTrigger + DatasetSwitchChip + DatasetSwitchPanel"
          copy="DatasetSwitchDemo"
          from="@/shared/ui/kit-additions"
          span
        >
          <DatasetSwitchDemo />
        </Specimen>
      </Section>

      {/* AutoScientist dataset picker */}
      <Section title="AutoScientist picker">
        <Specimen
          name="ChatInlineComposer + ChatDatasetPickerPanel + ChatSuggestionCard"
          copy="ChatComposerCompositeDemo"
          from="@/services/chat + @/shared/ui/kit-additions"
          span
        >
          <ChatComposerCompositeDemo />
        </Specimen>
        <Specimen
          name="ChatDatasetPickerPanel"
          from="@/shared/ui/kit-additions"
          span
        >
          <DatasetPickerDemo />
        </Specimen>
        <Specimen name="ChatDatasetPickerHeader" from="@/shared/ui/kit-additions">
          <div className="w-[280px] max-w-full">
            <ChatDatasetPickerHeader label="Add an AutoScientist" />
          </div>
        </Specimen>
        <Specimen name="ChatDatasetPickerItem" from="@/shared/ui/kit-additions" span>
          <div className="flex w-[380px] max-w-full flex-col gap-1">
            <ChatDatasetPickerItem label="Ultrachat Dataset 1" active onAdd={() => {}} />
            <ChatDatasetPickerItem label="legal_multichoice_qa" onAdd={() => {}} />
          </div>
        </Specimen>
      </Section>

      {/* Highlight tool — edit suggestions */}
      <Section title="Highlight tool · edit suggestions">
        <Specimen
          name="Edit suggestions popover"
          from="@/features/chat/suggestions/ui/chat-followup-suggestions"
          span
        >
          <EditSuggestionsDemo />
        </Specimen>
        <Specimen name="FollowupSuggestionButton" from="chat-followup-suggestions" span>
          <div className="flex w-[280px] max-w-full flex-col gap-2">
            <FollowupSuggestionButton
              label="Make the header larger"
              hideEndIconUntilHover
              endIcon={<ArrowRightIcon svgClasses="size-4" />}
            />
            <FollowupSuggestionButton
              label="Ask something else"
              endIcon={<PlusSmallIcon svgClasses="size-3" />}
            />
          </div>
        </Specimen>
        <Specimen name="FollowupBackButton" from="chat-followup-suggestions">
          <FollowupBackButton aria-label="Back" />
        </Specimen>
        <Specimen name="CustomFollowupTextarea" from="chat-followup-suggestions" span>
          <CustomFollowupTextarea
            defaultValue=""
            rows={3}
            placeholder="Describe the change"
            actions={<ArrowUpIcon svgClasses="size-4" />}
          />
        </Specimen>
      </Section>

      {/* The interface window */}
      <Section title="The interface window">
        <Specimen name="FloatingWindow" from="@/shared/ui/kit-additions" span>
          <WindowDemo />
        </Specimen>
      </Section>
    </GalleryPage>
  );
}

export const Component = AdditionsPage;
