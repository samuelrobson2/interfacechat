import { RefreshIcon } from "@/shared/assets/icons/outlined/Refresh";
import { Text } from "@/shared/ui/kit/text";

export function DatasetsHeader({
  onRefresh,
  children,
}: {
  onRefresh?: () => void;
  children?: React.ReactNode;
}) {
  return (
    <div className="w-full flex md:flex-row flex-col md:items-center justify-between gap-4 md:gap-0">
      <div className="flex items-center gap-4">
        <Text variant="h2">My data</Text>
        <button type="button" className="cursor-pointer" onClick={onRefresh}>
          <RefreshIcon pathClasses="stroke-icon-primary" />
        </button>
      </div>

      <div className="flex items-center gap-4">{children}</div>
    </div>
  );
}
