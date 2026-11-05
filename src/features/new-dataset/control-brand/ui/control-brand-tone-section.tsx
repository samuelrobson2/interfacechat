import { Text } from "@/shared/ui/kit/text";

export function ControlBrandToneSection({
  title,
  children,
  addButton,
}: {
  title: string;
  children: React.ReactNode;
  addButton: React.ReactNode;
}) {
  return (
    <div className="flex-1 flex flex-col gap-4">
      <div className="p-2 rounded-xl bg-background-primary flex justify-between items-center">
        <Text className="font-bold">{title}</Text>

        {addButton}
      </div>

      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}
