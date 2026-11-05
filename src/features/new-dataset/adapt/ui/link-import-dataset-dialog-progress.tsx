import { Progress, ProgressRow } from "@/shared/ui/kit/progress";
import { Text } from "@/shared/ui/kit/text";
import {
  type FileProgress
} from "../model/link/use-dataset-upload-progress";

export function LinkImportDatasetDialogProgress({
  filesProgress,
}: {
  filesProgress: Record<string, FileProgress>;
}) {
  return (
    <div className="flex flex-col gap-8 items-center justify-center overflow-hidden">
      <div className="flex flex-col items-center text-center gap-4 max-w-[320px]">
        <Text variant="h2">Almost there!</Text>
        <Text color="secondary">
          Your datasets are being loaded. Please wait…
        </Text>
      </div>

      <div className="flex flex-col gap-6 w-full overflow-y-auto no-scrollbar max-h-[420px]">
        {Object.entries(filesProgress).map(([name, progress]) => (
          <ProgressRow key={name} label={name} value={progress.progress}>
            <Progress value={progress.progress} />
          </ProgressRow>
        ))}
      </div>
    </div>
  );
}
