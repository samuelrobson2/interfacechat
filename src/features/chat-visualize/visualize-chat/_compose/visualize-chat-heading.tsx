import Lottie from "lottie-react";
import { href } from "react-router-dom";

import { ChatHeader, ChatHeaderBadge, useChatContext } from "@/services/chat";
import { FilledFolderIcon } from "@/shared/assets/icons/outlined/FilledFolder";
import loadingBlackAnimation from "@/shared/assets/lottie/loading-black.json";
import { ROUTES } from "@/shared/model/routes";
import { Text } from "@/shared/ui/kit/text";
import { isSampleDatasetId } from "../../new-visualize/model/sample-visualize";
import { useChartSession } from "../_model/use-chart-session";

export function VisualizeChatHeading() {
  const { data: session } = useChartSession();
  const isLoadingMore = useChatContext((state) => state.isLoadingMore);
  const datasetId = session?.dataset?.dataset_id;
  const datasetName = session?.dataset?.name;

  const datasetBadge =
    datasetId && datasetName && !isSampleDatasetId(datasetId) ? (
      <ChatHeaderBadge
        to={href(ROUTES.DASHBOARD_DATASET, { dataset_id: datasetId })}
        aria-label={`Open ${datasetName} dataset`}
        label={datasetName}
        icon={
          <FilledFolderIcon
            svgClasses="size-2 shrink-0"
            pathClasses="fill-icon-secondary"
          />
        }
      />
    ) : undefined;

  return (
    <ChatHeader start={datasetBadge}>
      {isLoadingMore && (
        <Lottie
          className="absolute top-1 right-[calc(25%-40px)] size-10 md:top-1/2 md:right-0 md:-translate-y-1/2"
          animationData={loadingBlackAnimation}
          loop={true}
        />
      )}
      <Text
        variant="label"
        color="secondary"
        as="span"
        className="max-w-[220px] min-w-0 truncate md:max-w-[400px]"
      >
        {session?.title?.trim() || "Untitled chart"}
      </Text>
    </ChatHeader>
  );
}
