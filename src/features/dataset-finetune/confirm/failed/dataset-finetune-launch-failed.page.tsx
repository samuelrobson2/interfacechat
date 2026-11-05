import { useEffect } from "react";
import {
  href,
  Link,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import brokenChainImage from "@/shared/assets/images/broken-chain.png";
import {
  ROUTES,
  type DatasetRoutes,
  type PathParams,
} from "@/shared/model/routes";
import { Button } from "@/shared/ui/kit/button";
import { Text } from "@/shared/ui/kit/text";
import { InfoViewTitle } from "@/shared/ui/info-view-layout";
import { InfoViewContent, InfoViewLayout } from "@/shared/ui/info-view-layout";
import { ArrowLeftIcon } from "@/shared/assets/icons/outlined/ArrowLeft";

type LaunchFailedLocationState = {
  errorMessage?: string;
};

function DatasetFinetuneLaunchFailedPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { dataset_id } = useParams<PathParams[DatasetRoutes]>();

  const errorMessage =
    (location.state as LaunchFailedLocationState | null)?.errorMessage ?? null;

  useEffect(() => {
    const onPopState = () => {
      navigate(ROUTES.DATASETS, { replace: true });
    };

    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", onPopState);

    return () => {
      window.removeEventListener("popstate", onPopState);
    };
  }, [navigate]);

  return (
    <InfoViewLayout>
      <img src={brokenChainImage} alt="Training launch failed" />

      <InfoViewContent>
        <InfoViewTitle
          title="Training launch failed"
          description={
            errorMessage ? <Text color="error">{errorMessage}</Text> : null
          }
        />
        <Button asChild>
          <Link to={href(ROUTES.DATASET_FINETUNE_CONFIRM, { dataset_id })}>
            <ArrowLeftIcon pathClasses="stroke-current" /> Go back
          </Link>
        </Button>
      </InfoViewContent>
    </InfoViewLayout>
  );
}

export const Component = DatasetFinetuneLaunchFailedPage;
