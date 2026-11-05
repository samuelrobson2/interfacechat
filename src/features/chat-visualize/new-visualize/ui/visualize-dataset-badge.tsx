import { ChainLinkIcon } from "@/shared/assets/icons/outlined/ChainLink";
import { cn } from "@/shared/lib/css";
import { Text } from "@/shared/ui/kit/text";

/** The dataset attached to the composer — clicking it reopens the picker. */
export function DatasetChipButton({
  name,
  className,
  ...props
}: Omit<React.ComponentProps<"button">, "children"> & {
  name: string;
}) {
  return (
    <button
      type="button"
      title={name}
      className={cn(
        "flex h-8 cursor-pointer items-center gap-2 rounded-[16px] bg-gray-6 px-3",
        className,
      )}
      {...props}
    >
      <Text variant="label" className="max-w-[220px] truncate">
        {name}
      </Text>
      <ChainLinkIcon
        svgClasses="size-4 shrink-0"
        pathClasses="stroke-icon-primary"
      />
    </button>
  );
}
