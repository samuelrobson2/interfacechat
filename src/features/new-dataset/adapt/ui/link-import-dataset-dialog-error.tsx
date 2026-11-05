import { Button } from "@/shared/ui/kit/button";
import { Text } from "@/shared/ui/kit/text";

export function LinkImportDatasetDialogError({
  error,
  onTryAgain,
}: {
  error: string;
  onTryAgain: () => void;
}) {
  return (
    <div className="flex flex-col items-center">
      <Text variant="h2">Something went wrong</Text>
      <Text className="mt-4" color="secondary">
        {error}
      </Text>
      <Button className="mt-8 min-w-[172px]" onClick={onTryAgain}>
        Try again
      </Button>
    </div>
  );
}
