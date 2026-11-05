import { useEffect } from "react";
import Lottie from "lottie-react";
import loadingBlackAnimation from "@/shared/assets/lottie/loading-black.json";
import { Text } from "@/shared/ui/kit/text";
import { cn } from "@/shared/lib/css";

interface CombineProgressOverlayProps {
  open: boolean;
  className?: string;
}

/**
 * Full-page blocking overlay rendered while the combine job runs. Sits above
 * the name dialog (z-[60] vs Radix's z-50) so the same screen covers the
 * picker and the dialog from "name confirmed" through "navigate into finetune".
 * Mirrors the new-dataset wizard's post-inference waiting screen so the user
 * sees one consistent loading pattern across the data-prep flow.
 */
export function CombineProgressOverlay({
  open,
  className,
}: CombineProgressOverlayProps) {
  // Lock scroll while the overlay is up — matches the pattern Radix Dialog
  // uses, but we render outside Dialog because there is no dismiss affordance.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn(
        "fixed inset-0 z-[60] bg-background",
        "flex flex-col items-center justify-center text-center",
        className,
      )}
    >
      <div className="mx-auto flex w-full max-w-[580px] flex-col items-center justify-center">
        <Lottie
          className="size-30"
          animationData={loadingBlackAnimation}
          loop={true}
        />
        <Text className="mt-14" variant="h1">
          Combining datasets
        </Text>
        <Text className="mt-4" color="secondary">
          We’re merging your selected datasets. This may take a moment for
          larger datasets.
        </Text>
      </div>
    </div>
  );
}
