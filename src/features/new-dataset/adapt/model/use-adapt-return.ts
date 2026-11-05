import {
  NEW_DATASET_RETURN_PARAM,
  NEW_DATASET_RETURN_TO,
  ROUTES,
  visualizePath,
} from "@/shared/model/routes";
import { isChatVisualizeEnabled } from "@/shared/model/feature-flag";
import { href, useNavigate, useSearchParams } from "react-router-dom";

export function useAdaptReturn() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const returnsToVisualize =
    isChatVisualizeEnabled() &&
    searchParams.get(NEW_DATASET_RETURN_PARAM) ===
      NEW_DATASET_RETURN_TO.VISUALIZE;

  const navigateAfterUpload = (datasetId: string) =>
    returnsToVisualize
      ? navigate(visualizePath(datasetId), { replace: true })
      : navigate(href(ROUTES.NEW_DATASET_ID, { dataset_id: datasetId }));

  return {
    returnsToVisualize,
    returnPath: visualizePath(),
    navigateAfterUpload,
    deferAdaption: returnsToVisualize,
  };
}

export function deferAdaptionFields(enabled: boolean): {
  defer_adaption?: boolean;
} {
  return enabled ? { defer_adaption: true } : {};
}
