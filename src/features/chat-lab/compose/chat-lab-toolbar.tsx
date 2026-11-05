import { useState, type ReactNode } from "react";
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
import { ChainLinkIcon } from "@/shared/assets/icons/outlined/ChainLink";
import { cn } from "@/shared/lib/css";
import { ConnectionsMenu } from "@/shared/ui/kit-additions";
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

type ToolId = "connections" | "documents";

function ChatLabToolbarButton({
  icon,
  label,
  expanded = false,
  ...props
}: Omit<React.ComponentProps<"button">, "children"> & {
  icon: ReactNode;
  label: string;
  expanded?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className="flex h-8 cursor-pointer items-center rounded-[8px] px-1.5 text-icon-primary"
      {...props}
    >
      {icon}
      <span
        className={cn(
          "grid transition-[grid-template-columns] duration-200 ease-out",
          expanded ? "grid-cols-[1fr]" : "grid-cols-[0fr]",
        )}
      >
        <span className="min-w-0 overflow-hidden">
          <span className="block pl-1.5 text-[14px] leading-none whitespace-nowrap">
            {label}
          </span>
        </span>
      </span>
    </button>
  );
}

/** Right-edge tools, each opening the same menus the interface editor uses. */
export function ChatLabToolbar() {
  const [hoveredId, setHoveredId] = useState<ToolId | null>(null);
  const [openId, setOpenId] = useState<ToolId | null>(null);

  const tool = (id: ToolId) => ({
    open: openId === id,
    onOpenChange: (open: boolean) =>
      setOpenId((current) => (open ? id : current === id ? null : current)),
    button: {
      expanded: hoveredId === id || openId === id,
      onMouseEnter: () => setHoveredId(id),
      onMouseLeave: () =>
        setHoveredId((current) => (current === id ? null : current)),
    },
  });
  const connections = tool("connections");
  const documents = tool("documents");

  return (
    <div className="flex items-center gap-1">
      <Popover open={connections.open} onOpenChange={connections.onOpenChange}>
        <PopoverTrigger asChild>
          <ChatLabToolbarButton
            icon={
              <ChainLinkIcon
                svgClasses="size-4"
                pathProps={TOOLBAR_ICON_STROKE}
              />
            }
            label="Connections"
            {...connections.button}
          />
        </PopoverTrigger>
        <PopoverContent
          align="end"
          sideOffset={10}
          className="w-auto border-0 bg-transparent p-0 shadow-none"
        >
          <ConnectionsMenu
            title="Connected to this chat"
            items={CONNECTIONS}
            actions={CONNECTION_ACTIONS}
          />
        </PopoverContent>
      </Popover>

      <Popover open={documents.open} onOpenChange={documents.onOpenChange}>
        <PopoverTrigger asChild>
          <ChatLabToolbarButton
            icon={
              <FileIcon svgClasses="size-4" pathProps={TOOLBAR_ICON_STROKE} />
            }
            label="Documents"
            {...documents.button}
          />
        </PopoverTrigger>
        <PopoverContent
          align="end"
          sideOffset={10}
          className="w-auto border-0 bg-transparent p-0 shadow-none"
        >
          <ConnectionsMenu
            title="Attached to this chat"
            items={DOCUMENTS}
            actions={DOCUMENT_ACTIONS}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
