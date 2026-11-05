import { ArrowRightIcon } from "@/shared/assets/icons/outlined/ArrowRight";
import { ROUTES } from "@/shared/model/routes";
import {
  InfoViewContent,
  InfoViewLayout,
  InfoViewTitle,
} from "@/shared/ui/info-view-layout";
import { Button } from "@/shared/ui/kit/button";
import { Link } from "react-router-dom";
import datasetNotFound from "@/shared/assets/images/dataset-not-found.png";

export function AutoscientistTableEmpty() {
  return (
    <InfoViewLayout className="flex flex-col justify-center items-center w-full">
      <img
        src={datasetNotFound}
        alt="Dataset not found"
        className="w-[280px] h-[280px]"
      />
      <InfoViewContent>
        <InfoViewTitle
          title="You haven't adapted any data yet"
          description="Start by adapting your data."
        />
        <Button className="min-w-[220px]" asChild>
          <Link to={ROUTES.NEW_DATASET_ADAPT}>
            Adapt my data <ArrowRightIcon pathClasses="stroke-current" />
          </Link>
        </Button>
      </InfoViewContent>
    </InfoViewLayout>
  );
}
