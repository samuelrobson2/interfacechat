import type { ReactNode } from "react";
import { href } from "react-router-dom";
import { ChatPillButton } from "@/services/chat";
import { HOME_TABS, homeTabPath, ROUTES } from "@/shared/model/routes";
import { cn } from "@/shared/lib/css";
import { Text } from "@/shared/ui/kit/text";
import { useChatSavedInterfaces } from "../model/use-chat-saved-interfaces";
import { ChatItemCard } from "../ui/chat-item-card";
import { InterfaceCard } from "../ui/interface-card";

export function ChatDashboardInterfaces({
  children,
}: {
  children?: ReactNode;
}) {
  return (
    <div className="mx-auto flex w-full max-w-[521px] flex-col items-center gap-8 overflow-y-auto no-scrollbar">
      <div
        className={cn(
          "grid w-full grid-cols-3 items-start justify-items-center gap-x-0 gap-y-6",
          "md:grid-cols-4 md:gap-y-8",
        )}
      >
        <div className="w-full px-3 md:px-4">
          <ChatItemCard
            className="aspect-square w-full gap-0"
            to={homeTabPath(HOME_TABS.CHAT)}
            title="New interface"
          />
        </div>

        {children}
      </div>
    </div>
  );
}

export function ChatDashboardInterfaceCells({
  q,
  domainGroup,
  createdAfter,
}: {
  q?: string;
  domainGroup?: string;
  createdAfter?: string;
}) {
  const { interfaces, hasMore, isLoadingMore, loadMore } =
    useChatSavedInterfaces({ q, domainGroup, createdAfter });

  const searchQuery = q?.trim();
  const isFiltering =
    Boolean(searchQuery) || Boolean(domainGroup) || Boolean(createdAfter);

  if (isFiltering && interfaces.length === 0) {
    return (
      <Text
        variant="label"
        color="secondary"
        className="col-span-3 py-8 text-center md:col-span-4"
      >
        {searchQuery
          ? `No interfaces found for “${searchQuery}”`
          : "No interfaces found"}
      </Text>
    );
  }

  return (
    <>
      {interfaces.map((item) => (
        <InterfaceCard
          key={item.message_id}
          className="w-full"
          to={item.to ?? href(ROUTES.CHAT, { chat_id: item.session_id })}
          title={item.title ?? "Untitled"}
          category={item.category}
        />
      ))}

      {hasMore && (
        <div className="col-span-2 flex justify-center md:col-span-4">
          <ChatPillButton
            shape="pill-text"
            className="w-[95px]"
            isLoading={isLoadingMore}
            onClick={loadMore}
            lottieClassName="size-5"
          >
            <Text variant="label" color="primary">
              Load more
            </Text>
          </ChatPillButton>
        </div>
      )}
    </>
  );
}
