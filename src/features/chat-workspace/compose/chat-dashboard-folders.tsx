import type { ReactNode } from "react";
import { ChatPillButton } from "@/services/chat";
import { HOME_TABS, homeTabPath } from "@/shared/model/routes";
import { Text } from "@/shared/ui/kit";
import { useChatDashboardFolders } from "../model/use-chat-dashboard-folders";
import { ChatFolderCard } from "../ui/chat-folder-card";
import { ChatItemCard } from "../ui/chat-item-card";

export function ChatDashboardFolders({ children }: { children?: ReactNode }) {
  return (
    <div className="flex w-full flex-col items-center gap-8 overflow-y-auto no-scrollbar">
      <div className="w-full grid grid-cols-2 justify-items-center gap-4 md:gap-y-8 md:grid-cols-4 md:gap-x-3">
        {/* Static CTA renders immediately; the suspended list arrives via children. */}
        <ChatItemCard
          className="w-full mt-3 mb-8"
          to={homeTabPath(HOME_TABS.CHAT)}
          title="New conversation"
        />

        {children}
      </div>
    </div>
  );
}

export function ChatDashboardFolderCells() {
  const { buckets, hasMore, isLoadingMore, loadMore } = useChatDashboardFolders();

  return (
    <>
      {buckets.map(({ key, icon, title, ...bucket }) => (
        <ChatFolderCard
          className="w-full"
          key={key}
          title={title}
          icon={icon && <img src={icon} alt={title} />}
          {...bucket}
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
