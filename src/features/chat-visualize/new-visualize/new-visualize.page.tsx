import { useSessionStore } from "@/services/auth";
import { ChatAiAvatar, ChatComposerDropdownSkeleton } from "@/services/chat";
import { cn } from "@/shared/lib/css";
import { GradientText } from "@/shared/ui/gradient-text";
import { Skeleton } from "@/shared/ui/kit/skeleton";
import { Text } from "@/shared/ui/kit/text";
import { Suspense, useState } from "react";
import {
  VisualizeBreadcrumb,
  VisualizeBreadcrumbFallback,
} from "./compose/visualize-breadcrumb";
import { VisualizeComposer } from "./compose/visualize-composer";
import {
  VisualizeDatasetOptions,
  VisualizeSelectedDatasetChip,
} from "./compose/visualize-dataset-picker";
import { VisualizeSuggestions } from "./compose/visualize-suggestions";
import { useCreateVisualization } from "./model/use-create-visualization";

const breadcrumbClassName = "shrink-0 px-4 pt-18 md:pt-12 md:pl-41.25";

function NewVisualizePage() {
  const userName = useSessionStore((state) => state.user?.profile?.name);
  const [message, setMessage] = useState("");
  const { startBlankSession } = useCreateVisualization();

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Suspense
        fallback={
          <VisualizeBreadcrumbFallback className={breadcrumbClassName} />
        }
      >
        <VisualizeBreadcrumb className={breadcrumbClassName} />
      </Suspense>

      <div className="flex flex-1 items-center justify-center px-4 py-10 md:px-12">
        <div
          className={cn("flex w-full max-w-165 flex-col items-center gap-10")}
        >
          <Text variant="h1" as="h1" className="text-center max-md:text-[32px]">
            Ready to visualize, <GradientText>{userName}!</GradientText>
          </Text>

          <ChatAiAvatar
            active={Boolean(message.trim())}
            preload
            className="w-25 md:w-36"
          />

          <div className="flex w-full flex-col gap-6">
            <VisualizeComposer
              message={message}
              onMessageChange={setMessage}
              renderDatasetChip={({ onClick }) => (
                <Suspense
                  fallback={<Skeleton className="h-8 w-30 rounded-2xl" />}
                >
                  <VisualizeSelectedDatasetChip onClick={onClick} />
                </Suspense>
              )}
              renderDatasetOptions={({ onSelect }) => (
                <Suspense fallback={<ChatComposerDropdownSkeleton />}>
                  <VisualizeDatasetOptions onSelect={onSelect} />
                </Suspense>
              )}
            />

            <VisualizeSuggestions />

            <button
              type="button"
              onClick={startBlankSession}
              className="self-center cursor-pointer"
            >
              <Text variant="label" color="secondary">
                Start a blank session
              </Text>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export const Component = NewVisualizePage;
