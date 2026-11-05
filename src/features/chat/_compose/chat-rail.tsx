import { chatCategoryLightBgVariants } from "@/services/chat";
import { ChatHistoryIcon } from "@/shared/assets/icons/general/ChatHistory";
import { ProjectsIcon } from "@/shared/assets/icons/general/Projects";
import { FolderIcon } from "@/shared/assets/icons/outlined/Folder";
import { cn } from "@/shared/lib/css";
import { Text } from "@/shared/ui/kit/text";
import { Link } from "react-router-dom";
import {
  useChatWorkspaceLists,
  type ChatProject,
  type ChatThread,
} from "../_model/use-chat-workspace-lists";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

const rowClassName = cn(
  "group flex w-full items-center gap-3 rounded-[16px] bg-background-primary px-4 py-3.5 text-left",
  "hairline [--hairline-color:var(--color-gray-3)] [--hairline-radius:16px] [--hairline-opacity:0.2]",
  "transition-colors hover:bg-gray-6",
);

/** Wraps row content in a Link, or a static div when not navigable (mock data). */
function RowShell({
  to,
  navigable,
  children,
}: {
  to: string;
  navigable: boolean;
  children: React.ReactNode;
}) {
  if (!navigable) return <div className={rowClassName}>{children}</div>;
  return (
    <Link to={to} className={rowClassName}>
      {children}
    </Link>
  );
}

function ChatRailSection({
  icon,
  title,
  emptyLabel,
  children,
  isEmpty,
}: {
  icon: React.ReactNode;
  title: string;
  emptyLabel: string;
  isEmpty: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="flex min-h-0 flex-col gap-5">
      <div className="flex items-center gap-2 px-1">
        {icon}
        <Text variant="label" className="text-typography-primary">
          {title}
        </Text>
      </div>
      {isEmpty ? (
        <Text variant="label" color="secondary" className="px-1 py-2">
          {emptyLabel}
        </Text>
      ) : (
        <div className="flex flex-col gap-3 overflow-y-auto">{children}</div>
      )}
    </section>
  );
}

function ProjectRow({
  project,
  navigable,
}: {
  project: ChatProject;
  navigable: boolean;
}) {
  return (
    <RowShell to={project.to} navigable={navigable}>
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full",
          // Reuse the chat-history category tint; fall back to neutral gray.
          project.color
            ? chatCategoryLightBgVariants({ color: project.color })
            : "bg-gray-6",
        )}
      >
        {project.icon ? (
          <img src={project.icon} alt="" className="size-7 object-contain" />
        ) : (
          <FolderIcon svgClasses="size-4" />
        )}
      </span>
      <Text variant="body" className="min-w-0 flex-1 truncate">
        {project.title}
      </Text>
      <Text variant="label" color="secondary" className="shrink-0">
        {project.count} {project.count === 1 ? "chat" : "chats"}
      </Text>
    </RowShell>
  );
}

function ThreadRow({
  thread,
  navigable,
}: {
  thread: ChatThread;
  navigable: boolean;
}) {
  return (
    <RowShell to={thread.to} navigable={navigable}>
      <Text variant="body" className="min-w-0 flex-1 truncate">
        {thread.title}
      </Text>
      <Text variant="label" color="secondary" className="shrink-0">
        {formatDate(thread.date)}
      </Text>
    </RowShell>
  );
}

/**
 * The projects + history lists. `layout="stacked"` stacks them vertically (used
 * by the side rail); `layout="columns"` lays them out as two columns (used when
 * the lists sit below the chat composer).
 */
export function ChatLists({
  layout = "stacked",
  className,
}: {
  layout?: "stacked" | "columns";
  className?: string;
}) {
  const { projects, history, isMock } = useChatWorkspaceLists();
  // Project folders have no mock detail page (would 404), but history threads
  // open a chat thread (the route renders a mock thread in dev), so keep those
  // clickable even with mock data.
  const isColumns = layout === "columns";

  return (
    <div
      className={cn(
        isColumns
          ? "grid w-full grid-cols-1 gap-12 md:grid-cols-2"
          : "flex flex-col gap-12",
        className,
      )}
    >
      <ChatRailSection
        icon={<ProjectsIcon svgClasses="size-5" />}
        title="Projects"
        emptyLabel="No projects yet."
        isEmpty={projects.length === 0}
      >
        {projects.map((project) => (
          <ProjectRow
            key={project.id}
            project={project}
            navigable={!isMock}
          />
        ))}
      </ChatRailSection>

      <ChatRailSection
        icon={<ChatHistoryIcon svgClasses="size-5" />}
        title="History"
        emptyLabel="No chats yet."
        isEmpty={history.length === 0}
      >
        {history.map((thread) => (
          <ThreadRow key={thread.id} thread={thread} navigable />
        ))}
      </ChatRailSection>
    </div>
  );
}
