import { cn } from "@/shared/lib/css";
import { Checkbox } from "@/shared/ui/kit/checkbox";
import { TruncatedText } from "@/shared/ui/kit/truncated-text";

export function LinkImportDatasetDialogItem({
  dataset_id,
  name,
  isSelected,
  onSelectionChange,
  className,
  ...props
}: React.ComponentProps<"label"> & {
  dataset_id: string;
  name: string;
  isSelected: boolean;
  onSelectionChange: (id: string, selected: boolean) => void;
}) {
  return (
    <label
      className={cn(
        "flex items-center justify-between w-full cursor-pointer",
        className,
      )}
      {...props}
    >
      <TruncatedText>{name}</TruncatedText>
      <Checkbox
        checked={isSelected}
        onCheckedChange={(checked) =>
          onSelectionChange(dataset_id, checked === true)
        }
      />
    </label>
  );
}
