import { Suspense, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BackIcon } from "@/shared/assets/icons/general/Back";
import { Button, Text } from "@/shared/ui/kit";
import {
  ChatFolderContent,
  ChatFolderContentCells,
} from "./compose/chat-folder-content";
import { useChatFolderRoute } from "./model/use-chat-folder-route";
import { ChatFolderCard } from "./ui/chat-folder-card";
import { ChatFolderSearch } from "./ui/chat-folder-search";
import { ChatSessionSkeletonCells } from "./ui/dashboard-skeletons";

function ChatFolderPage() {
  const { directoryId, title, color, icon } = useChatFolderRoute();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  return (
    <div className="relative flex h-dvh w-full flex-col overflow-y-auto px-6.5 pb-12 md:h-screen md:px-[var(--sidebar-gutter)] md:pb-12">
      <Button
        variant="ghost"
        size="icon"
        aria-label="Go back"
        radius="rounded"
        onClick={() => navigate(-1)}
        className="absolute right-12 top-10 hidden size-12 border border-stroke-secondary shadow-inset-default md:flex"
      >
        <BackIcon className="size-5" pathClasses="fill-current" />
      </Button>

      <div className="mx-auto flex w-full flex-col items-center gap-8 pt-[110px] md:gap-3 md:pt-[110px] overflow-hidden">
        <div className="flex w-full flex-col items-center gap-6 md:w-[672px]">
          <ChatFolderCard
            color={color}
            icon={icon && <img src={icon} alt={title} />}
            className="w-[153px]"
          />
          <Text
            variant="h1"
            as="h1"
            className="text-center max-md:text-[32px]"
          >
            {title}
          </Text>

          <ChatFolderSearch
            onSearch={setSearch}
            wrapperClassName="w-full md:self-end md:w-fit"
          />
        </div>

        <ChatFolderContent title={title}>
          <Suspense fallback={<ChatSessionSkeletonCells />}>
            <ChatFolderContentCells
              directoryId={directoryId}
              color={color}
              q={search}
              initialLimit={8}
            />
          </Suspense>
        </ChatFolderContent>
      </div>
    </div>
  );
}

export const Component = ChatFolderPage;
