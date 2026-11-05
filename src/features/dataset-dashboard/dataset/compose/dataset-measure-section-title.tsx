import { Text } from "@/shared/ui/kit/text";

export function DatasetMeasureSectionTitle({
  overline,
  title,
  uppercaseOverline = false,
}: {
  overline: string;
  title: string;
  uppercaseOverline?: boolean;
}) {
  return (
    <div className="flex flex-col gap-[12px]">
      <Text
        variant="small"
        color="secondary"
        className={uppercaseOverline ? "uppercase" : undefined}
      >
        {overline}
      </Text>
      <Text variant="h1">{title}</Text>
    </div>
  );
}
