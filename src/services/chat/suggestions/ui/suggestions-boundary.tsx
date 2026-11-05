import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import {
  ChatBubbleSuggestionsSkeleton,
  type BubbleSuggestionsVariant,
} from "./bubble-suggestions";

export function ChatSuggestionsBoundary({
  resetKey,
  onFailed,
  variant = "row",
  children,
}: React.PropsWithChildren<{
  resetKey: string;
  onFailed: (resetKey: string) => void;
  variant?: BubbleSuggestionsVariant;
}>) {
  return (
    <ErrorBoundary
      resetKeys={[resetKey]}
      onError={() => onFailed(resetKey)}
      fallbackRender={() => null}
    >
      <Suspense fallback={<ChatBubbleSuggestionsSkeleton variant={variant} />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}
