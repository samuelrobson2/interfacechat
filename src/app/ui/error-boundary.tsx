import { DATASET_UPLOAD_FAILED_CODE } from "@/features/new-dataset";
import { AppSidebar } from "@/features/sidebar";
import { isApiError } from "@/shared/api/api-error";
import brokenChainImage from "@/shared/assets/images/broken-chain.png";
import { CONFIG } from "@/shared/model/config";
import { ROUTES } from "@/shared/model/routes";
import {
  InfoViewContent,
  InfoViewLayout,
  InfoViewTitle,
} from "@/shared/ui/info-view-layout";
import { Button } from "@/shared/ui/kit/button";
import { SidebarProvider } from "@/shared/ui/kit/sidebar";
import { Link, useRouteError } from "react-router-dom";
import { AppNotFound } from "./not-found.page";

function AppError({ error }: { error: unknown }) {
  const isApi = isApiError(error);
  const isError = error instanceof Error;
  const errorMessage = isApi ? error.error : "Something went wrong";
  const errorDescription = isApi
    ? error.responseMessage
    : "We're sorry, but something unexpected happened. Please try refreshing the page";
  const isDatasetUploadFailed =
    isApi && error.code === DATASET_UPLOAD_FAILED_CODE;

  return (
    <InfoViewLayout>
      <img src={brokenChainImage} alt="Broken chain" />

      <InfoViewContent>
        <InfoViewTitle title={errorMessage} description={errorDescription} />

        {CONFIG.DEV && (isApi || isError) && (
          <details className="mt-4 text-left">
            <summary className="cursor-pointer text-sm text-muted-foreground">
              Error Details
            </summary>
            <div className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
              {isApi && (
                <div className="mb-2">
                  <div className="font-semibold mb-1">API Error:</div>
                  {error.statusCode && (
                    <div>Status Code: {error.statusCode}</div>
                  )}
                  {error.responseMessage && (
                    <div>Message: {error.responseMessage}</div>
                  )}
                  {error.error && <div>Error: {error.error}</div>}
                </div>
              )}
              {isError && error.stack && (
                <div>
                  <div className="font-semibold mb-1">Stack Trace:</div>
                  <pre className="whitespace-pre-wrap">{error.stack}</pre>
                </div>
              )}
            </div>
          </details>
        )}

        {isDatasetUploadFailed ? (
          <Button asChild>
            <Link to={ROUTES.NEW_DATASET_ADAPT}>Try again</Link>
          </Button>
        ) : (
          <Button onClick={() => window.location.reload()}>Reload page</Button>
        )}
      </InfoViewContent>
    </InfoViewLayout>
  );
}

function ErrorBoundaryBase({ backLink }: { backLink: string }) {
  const error = useRouteError();
  const isApi = isApiError(error);

  if (isApi && error.statusCode === 404) {
    // 404 API errors
    return (
      <AppNotFound
        title={error.message ?? "Page not found"}
        description="We couldn't find the page you're looking for. It might have been moved or doesn't exist anymore."
        link={backLink}
      />
    );
  }

  return <AppError error={error} />;
}

export function GlobalErrorBoundary() {
  return <ErrorBoundaryBase backLink={ROUTES.HOME} />;
}

export function AppErrorBoundary() {
  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <ErrorBoundaryBase backLink={ROUTES.HOME} />
      </SidebarProvider>
    </>
  );
}
