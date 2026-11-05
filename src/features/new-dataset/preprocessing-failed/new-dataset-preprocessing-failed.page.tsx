import brokenChainImage from "@/shared/assets/images/broken-chain.png";
import { ArrowLeftIcon } from "@/shared/assets/icons/outlined/ArrowLeft";
import { Button } from "@/shared/ui/kit/button";
import { ArrowRightIcon } from "@/shared/assets/icons/outlined/ArrowRight";
import { href, Link, useParams } from "react-router-dom";
import {
  NewDatasetStepsContentWrapper,
  NewDatasetStepsTitle,
} from "../_ui/new-dataset-steps-layout";

import {
  ROUTES,
  type DatasetRoutes,
  type PathParams,
} from "@/shared/model/routes";

function NewDatasetPreprocessingFailedPage() {
  const { dataset_id } = useParams<PathParams[DatasetRoutes]>();

  return (
    <div className="flex-col w-full h-screen">
      <NewDatasetStepsContentWrapper>
        <Button variant="secondary" className="min-w-[172px]" asChild>
          <Link
            to={href(ROUTES.NEW_DATASET_PREPROCESSING, {
              dataset_id: dataset_id!,
            })}
          >
            <ArrowLeftIcon pathClasses="stroke-current" /> Back
          </Link>
        </Button>

        <div className="flex flex-col items-center justify-center gap-14">
          <NewDatasetStepsTitle
            className="max-w-[600px] text-center gap-6"
            title="Adaption can only begin after data pre-processing"
            subtitle="Try uploading again once it is in a CSV, JSON, JSONL, Parquet format"
          />
          <img src={brokenChainImage} alt="Preprocessing failed" />
        </div>

        <Button className="min-w-[172px]" asChild>
          <Link
            to={href(ROUTES.NEW_DATASET_PREPROCESSING, {
              dataset_id: dataset_id!,
            })}
          >
            Try again <ArrowRightIcon pathClasses="stroke-current" />
          </Link>
        </Button>
      </NewDatasetStepsContentWrapper>
    </div>
  );
}

export const Component = NewDatasetPreprocessingFailedPage;
