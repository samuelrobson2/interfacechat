//import { connectGoogleOAuth } from "@/services/auth";
import { connectKaggleOAuth, useKaggleOAuthCallback } from "@/services/auth";
import {
  DATASET_STATUSES,
  datasetQueryOptions,
  useDatasetCache,
} from "@/services/dataset";
import { paymentQueryOptions, useSubscriptionData } from "@/services/payment";
import {
  AddApiKeyDialog,
  KAGGLE_OAUTH_PROVIDER,
  useApiKeysSuspense,
} from "@/services/settings";
import { FileFilledIcon } from "@/shared/assets/icons/general/FileFilled";
import googleSheetsImage from "@/shared/assets/images/google-sheets.svg";
import huggingfaceImage from "@/shared/assets/images/huggingface.svg";
import kaggleImage from "@/shared/assets/images/kaggle.svg";
import excelImage from "@/shared/assets/images/microsoft-office-excel.svg";
import notionImage from "@/shared/assets/images/notion.svg";
import slackImage from "@/shared/assets/images/slack.svg";
import { Button } from "@/shared/ui/kit/button";
import { Separator } from "@/shared/ui/kit/separator";
import { useSuspenseQueries } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { isDownloadDisabled } from "../../dataset-download-check";
import { DatasetDownloadMenu } from "../../dataset-download-menu";
import { useHuggingfaceExport } from "../model/use-huggingface-export";
//import { useGoogleSheetsExport } from "../model/use-google-sheets-export";
import { useKaggleExport } from "../model/use-kaggle-export";
import {
  DatasetConfigCard,
  DatasetConfigCardButton,
  DatasetConfigLayout,
  DatasetConfigSection,
} from "../ui/dataset-config-layout";
import { DatasetExportDialog } from "../ui/dataset-export-dialog";
import { HUGGINGFACE_PROVIDER } from "@/services/settings";
import { useIsMobile } from "@/shared/lib/react/use-mobile";

export function DatasetShare() {
  const isMobile = useIsMobile();
  useKaggleOAuthCallback();
  const dataset = useDatasetCache();
  const [
    { data: datasetProgress },
    { data: subscriptions },
    { data: activeGrantedPlan },
  ] = useSuspenseQueries({
    queries: [
      datasetQueryOptions.datasetProgress([dataset?.dataset_id ?? ""]),
      paymentQueryOptions.subscription(),
      paymentQueryOptions.activeGrantedPlan(),
    ],
  });

  const { handleHuggingfaceExport, isPending: isHuggingfacePending } =
    useHuggingfaceExport();
  const { exportKaggleDataset, isPending: isKagglePending } = useKaggleExport();
  //const { handleGoogleSheetsExport, isPending: isGoogleSheetsPending } =
  //  useGoogleSheetsExport();

  const { isFreePlan } = useSubscriptionData(subscriptions, activeGrantedPlan);
  const [searchParams, setSearchParams] = useSearchParams();

  const { isApiKeyExists } = useApiKeysSuspense();
  const huggingfaceKeyExists = isApiKeyExists(HUGGINGFACE_PROVIDER);
  const kaggleConnected = isApiKeyExists(KAGGLE_OAUTH_PROVIDER);
  //const googleSheetsKeyExists = isApiKeyExists("google_sheets");

  const shouldOpenKaggleExport = searchParams.get("startExport") === "kaggle";

  const onClose = () => {
    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.delete("startExport");
    setSearchParams(nextSearchParams, { replace: true });
  };

  const _isDownloadDisabled =
    (dataset?.status !== DATASET_STATUSES.ready ||
      isDownloadDisabled(
        datasetProgress?.datasets?.[0]?.progress_percentage,
      )) &&
    dataset?.kind !== "combined";

  return (
    <DatasetConfigLayout>
      <DatasetConfigSection>
        {/* Download */}
        <DatasetConfigCard
          icon={
            <FileFilledIcon
              className="size-12"
              pathClasses="fill-icon-primary"
            />
          }
          title="Download"
          description="Download your dataset instantly. Keep a local copy for further analysis, backup, or offline use — ready whenever you need it."
          button={
            <DatasetDownloadMenu
              datasetName={dataset?.name}
              datasetId={dataset?.dataset_id}
              renderTrigger={(isLoading) => (
                <Button
                  size="48"
                  variant="secondary"
                  isLoading={isLoading}
                  disabled={_isDownloadDisabled}
                >
                  Download
                </Button>
              )}
            />
          }
        />

        {/* Kaggle */}
        <DatasetConfigCard
          icon={<img src={kaggleImage} alt="Kaggle" />}
          title="Kaggle"
          description="Send your dataset directly to Kaggle. Analyze, visualize, and share insights with the data science community — all in one place"
          button={
            kaggleConnected ? (
              <DatasetExportDialog
                provider="Kaggle"
                isFreePlan={isFreePlan}
                onExport={(isPrivate) => exportKaggleDataset(isPrivate)}
                onClose={onClose}
                defaultOpen={shouldOpenKaggleExport}
                trigger={
                  <DatasetConfigCardButton isLoading={isKagglePending}>
                    Export
                  </DatasetConfigCardButton>
                }
              />
            ) : (
              <Button
                variant="secondary"
                size="48"
                onClick={() => connectKaggleOAuth(dataset?.dataset_id ?? "")}
              >
                Connect
              </Button>
            )
          }
        />

        {/* Slack */}
        <DatasetConfigCard
          disabled
          icon={<img src={slackImage} alt="Slack" />}
          title="Slack"
          description="Notify a channel or individual in Slack with real-time typeform responses so the right person can react in an instant"
          hidden={isMobile}
          button={
            <DatasetConfigCardButton disabled>
              Coming Soon
            </DatasetConfigCardButton>
          }
        />

        {/* Excel */}
        <DatasetConfigCard
          disabled
          icon={<img src={excelImage} alt="Excel" />}
          title="Excel"
          description="Send your data to excel. Analyze and visualize data in excel online"
          hidden={isMobile}
          button={
            <DatasetConfigCardButton disabled>
              Coming Soon
            </DatasetConfigCardButton>
          }
        />
      </DatasetConfigSection>

      <Separator
        orientation="vertical"
        color="secondary"
        className="hidden md:block"
      />

      <DatasetConfigSection>
        {/* Hugging Face */}
        <DatasetConfigCard
          icon={<img src={huggingfaceImage} alt="Hugging Face" />}
          title="Hugging Face"
          description="Export your data to Hugging Face. Fine-tune models, create datasets, or share your results with the AI research community"
          button={
            huggingfaceKeyExists ? (
              <DatasetExportDialog
                provider="Hugging Face"
                isFreePlan={isFreePlan}
                onExport={(isPrivate) => handleHuggingfaceExport(isPrivate)}
                trigger={
                  <DatasetConfigCardButton isLoading={isHuggingfacePending}>
                    Export
                  </DatasetConfigCardButton>
                }
              />
            ) : (
              <AddApiKeyDialog
                action="Add"
                provider={HUGGINGFACE_PROVIDER}
                trigger={
                  <DatasetConfigCardButton>Add key</DatasetConfigCardButton>
                }
              />
            )
          }
        />

        {/* Google Sheets */}
        <DatasetConfigCard
          disabled
          icon={<img src={googleSheetsImage} alt="Google Sheets" />}
          title="Google Sheets"
          description="Send your data straight to Google Sheets. Automatically syncs as results come in View your spreadsheet"
          hidden={isMobile}
          button={
            <>
              <DatasetConfigCardButton disabled>
                Coming Soon
              </DatasetConfigCardButton>
              {/*  {googleSheetsKeyExists ? (
                <DatasetExportDialog
                  provider="Google Sheets"
                  isFreePlan={isFreePlan}
                  onExport={(isPrivate) => handleGoogleSheetsExport(isPrivate)}
                  onClose={onClose}
                  defaultOpen={
                    searchParams.get("startExport") === "google-sheets"
                  }
                  trigger={
                    <DatasetConfigCardButton isLoading={isGoogleSheetsPending}>
                      Export
                    </DatasetConfigCardButton>
                  }
                />
              ) : (
                <Button
                  variant="secondary"
                  size="48"
                  onClick={() => connectGoogleOAuth(dataset?.dataset_id ?? "")}
                >
                  Connect
                </Button>
              )} */}
            </>
          }
        />

        {/* Notion */}
        <DatasetConfigCard
          disabled
          icon={<img src={notionImage} alt="Notion" />}
          title="Notion"
          description="Send data to your Notion database"
          hidden={isMobile}
          button={
            <DatasetConfigCardButton disabled>
              Coming Soon
            </DatasetConfigCardButton>
          }
        />
      </DatasetConfigSection>
    </DatasetConfigLayout>
  );
}
