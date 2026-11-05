import { FeedbackFormDialog } from "@/services/settings";
import processingFailedImage from "@/shared/assets/images/processing-failed.png";
import {
  InfoViewContent,
  InfoViewLayout,
  InfoViewTitle,
} from "@/shared/ui/info-view-layout";
import { Button } from "@/shared/ui/kit/button";
import { Skeleton } from "@/shared/ui/kit/skeleton";
import { Suspense } from "react";
import { RetryAdaptionButton } from "../../datasets/ui/retry-adaption-button";

export function DatasetFailedView({
  dataset_id,
  errorMessage,
  errorDescription,
  hideRetry,
}: {
  dataset_id: string;
  errorMessage?: string;
  errorDescription?: string;
  hideRetry?: boolean;
}) {
  return (
    // The gutter is on the *right* here: this view is centred inside the rail's
    // reserved column, so it pads the far side to match rather than the near one.
    <InfoViewLayout className="mt-[-100px] gap-8 overflow-y-auto md:gap-14 md:pr-[var(--sidebar-gutter)]">
      <img
        src={processingFailedImage}
        alt="Processing failed"
        className="w-full max-w-[200px] shrink-0 md:max-w-[320px]"
      />

      <InfoViewContent className="w-full max-w-[560px]">
        <InfoViewTitle
          title={errorMessage}
          description={errorDescription}
          descriptionClassName="[overflow-wrap:anywhere]"
        />

        <div className="flex justify-center gap-2">
          <Suspense fallback={<Skeleton className="w-[200px] h-14" />}>
            <FeedbackFormDialog
              trigger={
                <Button variant="secondary" className="w-[200px] h-14">
                  Get Support
                </Button>
              }
            />
          </Suspense>
          {!hideRetry && (
            <RetryAdaptionButton
              dataset_id={dataset_id}
              variant="primary"
              redirectToDashboard
              className="w-[200px] h-14 hidden md:block"
            >
              Try again
            </RetryAdaptionButton>
          )}
        </div>
      </InfoViewContent>
    </InfoViewLayout>
  );
}
