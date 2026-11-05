import { PaymentTopUpForm, useCreditsTopUp } from "@/services/payment";
import { refetchDatasetsAfterLaunch } from "@/services/dataset";
import { RelaunchIcon } from "@/shared/assets/icons/outlined/Relaunch";
import {
  ApiError,
  getApiErrorMessage,
  isApiError,
} from "@/shared/api/api-error";
import { rqClient } from "@/shared/api/instance";
import { queryClient } from "@/shared/api/query-client";
import type { ApiSchemas } from "@/shared/api/schema";
import { Button } from "@/shared/ui/kit/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/kit/dialog";
import { HOME_TABS, homeTabPath } from "@/shared/model/routes";
import { toast } from "@/shared/ui/kit/sonner-toast";
import type { ComponentProps } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const TOP_UP_FORM_ID = "retry-adaption-top-up-form";

const getMissingCredits = (error: ApiError) => {
  const details = error.details as Partial<
    ApiSchemas["InsufficientCreditsInfoDto"]
  >;
  const creditsRequired = Number(details?.creditsRequired ?? 0);
  const creditsAvailable = Number(details?.creditsAvailable ?? 0);
  return Math.max(creditsRequired - creditsAvailable, 0);
};

export function RetryAdaptionButton({
  dataset_id,
  variant = "link",
  className,
  children,
  redirectToDashboard = false,
}: {
  dataset_id: string;
  variant?: ComponentProps<typeof Button>["variant"];
  className?: string;
  children?: React.ReactNode;
  redirectToDashboard?: boolean;
}) {
  const navigate = useNavigate();
  const { mutateAsync: launchDataset } = rqClient.useMutation(
    "post",
    "/datasets/{dataset_id}/launch",
  );
  const { topUpCredits, isPending: isPendingTopUp } = useCreditsTopUp();
  const [isRelaunching, setIsRelaunching] = useState(false);
  const [isTopUpDialogOpen, setIsTopUpDialogOpen] = useState(false);
  const [missingCredits, setMissingCredits] = useState(0);

  const handleRetry = async () => {
    setIsRelaunching(true);
    try {
      await launchDataset({
        params: { path: { dataset_id } },
        body: {},
      });

      await refetchDatasetsAfterLaunch(queryClient);

      toast.success("Dataset relaunched successfully");

      if (redirectToDashboard) {
        navigate(homeTabPath(HOME_TABS.BUILD));
      }
    } catch (error) {
      if (isApiError(error) && error.statusCode === 402) {
        setMissingCredits(getMissingCredits(error));
        setIsTopUpDialogOpen(true);
        return;
      }
      toast.error(getApiErrorMessage(error, "Failed to relaunch dataset"));
    } finally {
      setIsRelaunching(false);
    }
  };

  return (
    <>
      <Button
        variant={variant}
        className={className}
        onClick={handleRetry}
        disabled={isRelaunching}
      >
        {children ?? (
          <>
            <RelaunchIcon pathClasses="stroke-current" />
            Retry
          </>
        )}
      </Button>

      <Dialog open={isTopUpDialogOpen} onOpenChange={setIsTopUpDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="max-w-[420px] mx-auto">
              You need {missingCredits.toLocaleString()} more credits to run
              this job
            </DialogTitle>
          </DialogHeader>

          <PaymentTopUpForm
            id={TOP_UP_FORM_ID}
            onSubmit={(values) => {
              void topUpCredits(Number(values.amount));
            }}
            disabled={isPendingTopUp}
            defaultAmount={missingCredits}
          />

          <DialogFooter>
            <Button
              type="submit"
              form={TOP_UP_FORM_ID}
              className="flex-1"
              isLoading={isPendingTopUp}
            >
              Top up
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
