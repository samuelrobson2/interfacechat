import {
  ChatComposerAttachButton,
  ChatComposerSendButton,
  ChatTextareaComposer,
  type ChatCategory,
  getChatCategoryIcon,
} from "@/services/chat";
import aiPoster from "@/shared/assets/images/ai-avatar.png";
import { BillingIcon } from "@/shared/assets/icons/general/Billing";
import { FileIcon } from "@/shared/assets/icons/general/File";
import { SettingsIcon } from "@/shared/assets/icons/general/Settings";
import { ChevronBottomIcon } from "@/shared/assets/icons/outlined/ChevronBottom";
import { FolderIcon } from "@/shared/assets/icons/outlined/Folder";
import { cn } from "@/shared/lib/css";
import { Badge } from "@/shared/ui/kit/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/kit/dropdown-menu";
import { toast } from "@/shared/ui/kit/sonner-toast";
import { Text } from "@/shared/ui/kit/text";
import { LayoutToggle } from "@/shared/ui/layout-toggle";
import { useState, type ReactNode } from "react";
import { MOCK_CHAT_PROJECTS } from "../_model/chat-workspace-mock";
import { ChatSuggestionCard } from "../suggestions/ui/chat-suggestion-card";
import { ArticleDocument } from "./mock-article";
import { PaperExperience, PAPER_TITLE } from "./mock-paper";
import { RecipeApp } from "./mock-recipe-app";
import { RecipeDocument } from "./mock-recipe";
import { SavingsApp } from "./mock-savings-app";

const THREAD_TITLE = "Meal prep cooking techniques efficiency";
const USER_QUERY = "Compare cooking techniques for meal prep efficiency";
const INLINE_QUERY = "Got a quick salmon recipe for tonight?";
const APP_QUERY = "Build me a calculator to project my savings over time";
const SPLIT_QUERY = "Can you tell me about Leopold and Rudolf Blaschka?";

const FOLLOWUPS: { text: string; icon: ReactNode }[] = [
  {
    text: "Best containers for freezer expansion",
    icon: <FileIcon svgClasses="size-5" />,
  },
  {
    text: "Replacing damaged gaskets and seals",
    icon: <SettingsIcon svgClasses="size-5" />,
  },
  {
    text: "Cost comparison: glass vs. plastic long-term",
    icon: <BillingIcon svgClasses="size-5" />,
  },
];

type ThreadLayout = "split" | "inline" | "app" | "paper" | "default";

const LAYOUT_OPTIONS: { value: ThreadLayout; label: string }[] = [
  { value: "split", label: "Side Panel-Static" },
  { value: "inline", label: "Inline Interactive" },
  { value: "app", label: "Side Panel-Interactive" },
  { value: "paper", label: "Side Panel-Interactive Asset" },
  { value: "default", label: "Default" },
];

function ThreadHeader({
  title,
  category,
}: {
  title: string;
  category?: { label: string; key: ChatCategory };
}) {
  return (
    <div className="flex w-full shrink-0 justify-center px-6 pt-3">
      {/* Centered, fixed-width bar so the divider doesn't span the whole page.
          Adjust max-w to make it wider or narrower. */}
      <header className="relative flex w-full max-w-[900px] items-center justify-center border-b border-gray-2 pb-3">
        {category && (
          <Badge size="sm" color="neutral" className="absolute left-0 gap-1.5">
            <img
              src={getChatCategoryIcon(category.key)}
              alt=""
              className="size-4"
            />
            {category.label}
          </Badge>
        )}
        <button
          type="button"
          className="flex items-center gap-1.5 text-typography-secondary"
        >
          <Text variant="label">{title}</Text>
          <ChevronBottomIcon svgClasses="size-3.5" />
        </button>
      </header>
    </div>
  );
}

function SaveToProjectButton() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex items-center gap-1.5 rounded-[10px] px-3 py-1.5 text-typography-secondary transition-colors hover:bg-gray-2",
            "hairline [--hairline-color:var(--color-gray-3)] [--hairline-radius:10px]",
          )}
        >
          <FolderIcon svgClasses="size-4" />
          <Text variant="label">Save to project</Text>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {MOCK_CHAT_PROJECTS.map((project) => (
          <DropdownMenuItem
            key={project.id}
            onSelect={() => toast.success(`Saved to ${project.title}`)}
          >
            {project.title}
          </DropdownMenuItem>
        ))}
        <DropdownMenuItem
          onSelect={() => toast.success("New project created")}
        >
          + New project
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function UserMessage({ text }: { text: string }) {
  return (
    <div className="self-end max-w-[80%] rounded-[18px] bg-gray-2 px-4 py-2.5">
      <Text variant="body">{text}</Text>
    </div>
  );
}

function AssistantMessage({ children }: { children: ReactNode }) {
  return (
    <div className="flex gap-3">
      <img
        src={aiPoster}
        alt=""
        className="mt-1 size-7 shrink-0 rounded-full object-cover"
      />
      <div className="flex min-w-0 flex-1 flex-col gap-6">{children}</div>
    </div>
  );
}

export function MockChatThread() {
  const [value, setValue] = useState("");
  const [layout, setLayout] = useState<ThreadLayout>("split");
  const isSplit = layout === "split";
  const isInline = layout === "inline";
  const isApp = layout === "app";
  const isPaper = layout === "paper";

  const userText = isInline
    ? INLINE_QUERY
    : isApp
      ? APP_QUERY
      : isSplit
        ? SPLIT_QUERY
        : USER_QUERY;

  const conversation = (
    <div className="flex flex-col gap-8 py-6">
      <UserMessage text={userText} />
      <AssistantMessage>
        {isInline ? (
          // Inline: the artefact is small enough to live in the message itself.
          <>
            <Text variant="body" color="secondary">
              Here's a quick one — adjust the servings and tick off the
              ingredients as you go:
            </Text>
            <RecipeApp />
          </>
        ) : isApp ? (
          // App: the artefact is interactive and large, so it opens in the panel.
          <Text variant="body" color="secondary">
            Here's an interactive savings planner — it was a bit too big to keep
            inline, so it's in the panel on the right. Drag the sliders and the
            projection updates live.
          </Text>
        ) : isSplit ? (
          <Text variant="body" color="secondary">
            Here's a short piece on the Blaschkas — the father and son whose
            glass models still sit in museums today. I've opened it in the panel
            on the right.
          </Text>
        ) : (
          <div
            className={cn(
              "rounded-[16px] bg-white p-6",
              "hairline [--hairline-color:var(--color-gray-3)] [--hairline-radius:16px] [--hairline-opacity:0.25]",
            )}
          >
            <RecipeDocument />
          </div>
        )}
      </AssistantMessage>
    </div>
  );

  // Suggestions + composer, pinned to the bottom (the conversation scrolls).
  const footer = (
    <div className="flex shrink-0 flex-col gap-3 pb-8 pt-2">
      {!isApp && (
        <div className="flex gap-3">
          {FOLLOWUPS.map((followup) => (
            <ChatSuggestionCard
              key={followup.text}
              size="s"
              className="flex-1"
              suggestion={followup.text}
              icon={followup.icon}
              onClick={() => setValue(followup.text)}
            />
          ))}
        </div>
      )}
      <ChatTextareaComposer
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Reply…"
        frameClassName="h-[104px]"
        leftActions={<ChatComposerAttachButton />}
        rightActions={
          <ChatComposerSendButton active={value.trim().length > 0} />
        }
      />
    </div>
  );

  return (
    <div className="relative flex h-screen w-full flex-col bg-background-primary">
      <ThreadHeader
        title={
          isPaper
            ? PAPER_TITLE
            : isApp
              ? "Savings planner"
              : isSplit
                ? "Leopold and Rudolf Blaschka"
                : THREAD_TITLE
        }
        // Only the recipe layouts (inline / default) carry the cooking tag.
        category={
          isInline || (!isSplit && !isApp && !isPaper)
            ? { label: "Cooking", key: "cooking" }
            : undefined
        }
      />

      {isPaper ? (
        <PaperExperience />
      ) : isSplit || isApp ? (
        // Split / App: a smaller conversation column on the left, a larger
        // artefact pinned on the right (with a Save-to-project action).
        <div className="mx-auto flex w-full min-h-0 max-w-[1700px] flex-1 gap-50 pl-28 pr-8">
          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-visible">
            <div className="min-h-0 flex-1 overflow-y-auto no-scrollbar">
              {conversation}
            </div>
            {footer}
          </div>
          <aside
            className={cn(
              "my-6 flex shrink-0 flex-col overflow-hidden rounded-[16px] bg-white",
              isApp ? "w-[640px]" : "w-[820px]",
              "hairline [--hairline-color:var(--color-gray-3)] [--hairline-radius:16px] [--hairline-opacity:0.25]",
            )}
          >
            <div className="flex shrink-0 items-center justify-between border-b border-gray-2 px-5 py-3">
              <Text variant="label" color="secondary">
                {isApp ? "Savings planner" : "Article"}
              </Text>
              <SaveToProjectButton />
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto no-scrollbar p-6">
              {isApp ? <SavingsApp /> : <ArticleDocument />}
            </div>
          </aside>
        </div>
      ) : (
        // Default: everything inline in a single column.
        <div className="mx-auto flex w-full min-h-0 max-w-[960px] flex-1 flex-col overflow-visible pl-28 pr-8">
          <div className="min-h-0 flex-1 overflow-y-auto no-scrollbar">
            {conversation}
          </div>
          {footer}
        </div>
      )}

      <LayoutToggle
        value={layout}
        onChange={setLayout}
        options={LAYOUT_OPTIONS}
      />
    </div>
  );
}
