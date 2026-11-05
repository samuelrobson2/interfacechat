import { InventTags } from "./compose/invent-tags";
import { InventInput } from "./compose/invent-input";
import { Text } from "@/shared/ui/kit/text";

function NewDatasetInventPage() {
  return (
    <div className="flex flex-col items-center gap-12 mt-50 w-[840px] mx-auto">
      <Text variant="h1">Invent new data</Text>

      <InventTags />

      <InventInput />
    </div>
  );
}

export const Component = NewDatasetInventPage;
