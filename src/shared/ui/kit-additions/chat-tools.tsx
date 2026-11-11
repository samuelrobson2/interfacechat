import { useRef, useState, type ReactNode } from "react";
import {
  Boxes,
  Database,
  FileSpreadsheet,
  FileText,
  FolderOpen,
  Globe,
  Upload,
} from "lucide-react";
import { FileIcon } from "@/shared/assets/icons/general/File";
import { HighlightIcon } from "@/shared/assets/icons/general/Highlight";
import { ChainLinkIcon } from "@/shared/assets/icons/outlined/ChainLink";
import { PromptInputAttachButton } from "@/shared/compose/prompt-input";
import { cn } from "@/shared/lib/css";
import { ConnectionsMenu } from "./connections-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/ui/kit/popover";

const TOOLBAR_ICON_STROKE = { strokeWidth: 1.75 };

// Canned, like the interface editor's own lists.
const CONNECTIONS = [
  { id: "web", icon: Globe, label: "Web search", kind: "Tool" },
  {
    id: "dataset",
    icon: Database,
    label: "Conservation Programs",
    kind: "Dataset",
  },
];

const CONNECTION_ACTIONS = [
  { id: "data", icon: Database, label: "Connect data" },
  { id: "model", icon: Boxes, label: "Connect a model" },
];

const DOCUMENTS = [
  { id: "deck", icon: FileText, label: "Q3 board update.pdf", kind: "PDF" },
  {
    id: "cohorts",
    icon: FileSpreadsheet,
    label: "churn-cohorts.csv",
    kind: "CSV",
  },
];

const DOCUMENT_ACTIONS = [
  { id: "upload", icon: Upload, label: "Upload a document" },
  { id: "files", icon: FolderOpen, label: "Add from Files" },
];

function ChatToolButton({
  icon,
  label,
  active = false,
  className,
  ...props
}: Omit<React.ComponentProps<"button">, "children"> & {
  icon: ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      className={cn(
        "flex h-8 cursor-pointer items-center gap-1.5 rounded-[8px] px-1.5 text-icon-primary transition-colors hover:bg-gray-6",
        active && "bg-gray-6",
        className,
      )}
      {...props}
    >
      {icon}
      <span className="text-[14px] leading-none whitespace-nowrap">
        {label}
      </span>
    </button>
  );
}

/**
 * Chat's right-edge tools: Highlight, Connections and Documents, each opening
 * the same menus the interface editor uses. Shared by Chat and the Workbench.
 */
export function ChatTools() {
  const [isHighlighting, setIsHighlighting] = useState(false);

  return (
    <div className="flex items-center gap-1">
      <ChatToolButton
        icon={
          <HighlightIcon svgClasses="size-4" pathClasses="fill-icon-primary" />
        }
        label="Highlight"
        active={isHighlighting}
        aria-pressed={isHighlighting}
        onClick={() => setIsHighlighting((on) => !on)}
      />

      <Popover>
        <PopoverTrigger asChild>
          <ChatToolButton
            icon={
              <ChainLinkIcon
                svgClasses="size-4"
                pathProps={TOOLBAR_ICON_STROKE}
              />
            }
            label="Connections"
          />
        </PopoverTrigger>
        <PopoverContent
          align="end"
          sideOffset={10}
          className="w-auto border-0 bg-transparent p-0 shadow-none"
        >
          <ChatConnectionsMenu />
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <ChatToolButton
            icon={
              <FileIcon svgClasses="size-4" pathProps={TOOLBAR_ICON_STROKE} />
            }
            label="Documents"
          />
        </PopoverTrigger>
        <PopoverContent
          align="end"
          sideOffset={10}
          className="w-auto border-0 bg-transparent p-0 shadow-none"
        >
          <ChatDocumentsMenu />
        </PopoverContent>
      </Popover>
    </div>
  );
}

const MENU_POPOVER = "w-auto border-0 bg-transparent p-0 shadow-none";

/** What this chat reads from, and the ways to connect more. */
export function ChatConnectionsMenu() {
  return (
    <ConnectionsMenu
      title="Connected to this chat"
      items={CONNECTIONS}
      actions={CONNECTION_ACTIONS}
    />
  );
}

/** Documents attached to this chat, and the ways to add more. */
export function ChatDocumentsMenu({ onUpload }: { onUpload?: () => void }) {
  return (
    <ConnectionsMenu
      title="Attached to this chat"
      items={DOCUMENTS}
      actions={DOCUMENT_ACTIONS.map((action) =>
        action.id === "upload" ? { ...action, onClick: onUpload } : action,
      )}
    />
  );
}

function ComposerToolButton({
  label,
  open,
  children,
  ...props
}: React.ComponentProps<"button"> & { label: string; open?: boolean }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-[60px] transition-colors hover:bg-gray-6",
        open && "bg-gray-6",
      )}
      {...props}
    >
      {children}
    </button>
  );
}

/**
 * The bottom-left of a chat input: attach a file, connections, and the
 * chat's documents. Attached files come back through `onAttach`.
 */
export function ChatComposerTools({
  onAttach,
}: {
  onAttach?: (files: File[]) => void;
}) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [openId, setOpenId] = useState<"connections" | "documents" | null>(
    null,
  );
  const openChange = (id: "connections" | "documents") => (open: boolean) =>
    setOpenId((current) => (open ? id : current === id ? null : current));
  const pickFiles = () => {
    setOpenId(null);
    fileInput.current?.click();
  };

  return (
    <div className="flex items-center gap-1">
      <input
        ref={fileInput}
        type="file"
        multiple
        hidden
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          if (files.length) onAttach?.(files);
          event.target.value = "";
        }}
      />
      <PromptInputAttachButton onClick={pickFiles} className="hover:bg-gray-6" />

      <Popover
        open={openId === "connections"}
        onOpenChange={openChange("connections")}
      >
        <PopoverTrigger asChild>
          <ComposerToolButton
            label="Connections"
            open={openId === "connections"}
          >
            <ChainLinkIcon
              svgClasses="size-4"
              pathProps={TOOLBAR_ICON_STROKE}
            />
          </ComposerToolButton>
        </PopoverTrigger>
        <PopoverContent
          side="top"
          align="start"
          sideOffset={10}
          className={MENU_POPOVER}
        >
          <ChatConnectionsMenu />
        </PopoverContent>
      </Popover>

      <Popover
        open={openId === "documents"}
        onOpenChange={openChange("documents")}
      >
        <PopoverTrigger asChild>
          <ComposerToolButton label="Documents" open={openId === "documents"}>
            <FileIcon svgClasses="size-4" pathProps={TOOLBAR_ICON_STROKE} />
          </ComposerToolButton>
        </PopoverTrigger>
        <PopoverContent
          side="top"
          align="start"
          sideOffset={10}
          className={MENU_POPOVER}
        >
          <ChatDocumentsMenu onUpload={pickFiles} />
        </PopoverContent>
      </Popover>
    </div>
  );
}
