import { format } from "date-fns";
import type { ReactNode } from "react";
import { href } from "react-router-dom";
import {
  ChatCreateCard,
  ChatItemCard,
  ChatPillButton,
  DatasetSourceBadge,
} from "@/services/chat";
import { ROUTES, visualizePath } from "@/shared/model/routes";
import { Text } from "@/shared/ui/kit/text";
import { useDashboardVisualizations } from "../model/use-dashboard-visualizations";

// Cards match the conversation cards inside folders, capped at three per row.
const gridClasses =
  "w-full grid grid-cols-2 md:grid-cols-3 justify-start gap-4 md:gap-6";

export function DashboardVisualizationsGrid({
  children,
}: {
  children?: ReactNode;
}) {
  return (
    <div className="mx-auto flex w-full max-w-[672px] flex-col items-center gap-8 overflow-y-auto no-scrollbar">
      <div className={gridClasses}>
        {/* Static CTA renders immediately; the suspended list arrives via children. */}
        <ChatCreateCard
          to={visualizePath()}
          title="New visualization"
          className="w-full"
        />

        {children}
      </div>
    </div>
  );
}

export function DashboardVisualizationCells() {
  const { visualizations, hasMore, isLoadingMore, loadMore } =
    useDashboardVisualizations();

  return (
    <>
      {visualizations.map((session) => (
        <ChatItemCard
          key={session.session_id}
          to={href(ROUTES.CHAT_VISUALIZE_SESSION, {
            chat_id: session.session_id,
          })}
          title={session.title?.trim() || "Untitled chart"}
          color="uncategorized"
          fillClassName="bg-gray-1-mid"
          date={format(new Date(session.updated_at), "MMMM d")}
          header={
            session.dataset?.name ? (
              <DatasetSourceBadge name={session.dataset.name} />
            ) : undefined
          }
          className="w-full"
        />
      ))}

      {hasMore && (
        <div className="col-span-2 flex justify-center md:col-span-3">
          <ChatPillButton
            shape="pill-text"
            className="w-[95px]"
            onClick={loadMore}
            isLoading={isLoadingMore}
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
