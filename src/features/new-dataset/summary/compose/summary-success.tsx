import { useSessionStore } from "@/services/auth";
import { datasetQueryOptions, type DatasetStatus } from "@/services/dataset";
import bigClockImage from "@/shared/assets/images/big-clock.png";
import { ROUTES } from "@/shared/model/routes";
import { Button } from "@/shared/ui/kit/button";
import { Skeleton } from "@/shared/ui/kit/skeleton";
import { Text } from "@/shared/ui/kit/text";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useLaunchEstimateStore } from "../model/launch-estimate-store";
import { DATASET_STATUSES } from "@/services/dataset";

// Format number to ordinal string (1st, 2nd, 3rd, 4th, etc.)
const formatOrdinal = (num: number): string => {
  if (num === 1) return "1st";
  if (num === 2) return "2nd";
  if (num === 3) return "3rd";
  return `${num}th`;
};

export function SummarySuccess({
  datasetStatus,
}: {
  datasetStatus: DatasetStatus;
}) {
  const { data, isLoading } = useQuery(
    datasetQueryOptions.datasets({ perPage: 1 }),
  );
  const estimatedMinutes = useLaunchEstimateStore((s) => s.estimatedMinutes);
  const user = useSessionStore((state) => state.user);

  return (
    <div className="flex flex-col -mt-7 mx-auto items-center text-center pb-15">
      <img src={bigClockImage} alt="Big Clock" />

      {datasetStatus === DATASET_STATUSES.launching ? (
        <>
          <Text className="mt-15" variant="h1">
            {user?.profile?.name}, congrats on adapting your{" "}
            {isLoading ? (
              <Skeleton className="w-14 h-6 inline-block" />
            ) : (
              formatOrdinal(data?.total ?? 1)
            )}
            <br />
            dataset. Your recipe is cooking
          </Text>
          <Text className="mt-4" color="secondary">
            {estimatedMinutes
              ? `The estimated dataset processing time is about ${estimatedMinutes} minutes. `
              : ""}
            We will email you as soon as your dataset is ready.
          </Text>
          <Button className="mt-10" asChild>
            <Link to={ROUTES.DATASETS}>View My Datasets</Link>
          </Button>
        </>
      ) : (
        <>
          <Text className="mt-15" variant="h1">
            {user?.profile?.name}, congrats on preprocessing your dataset
          </Text>
          <Text className="mt-4" color="secondary">
            We will email you as soon as your dataset is ready.
          </Text>
          <Button className="mt-10" asChild>
            <Link to={ROUTES.DATASETS}>View My Datasets</Link>
          </Button>
        </>
      )}
    </div>
  );
}
