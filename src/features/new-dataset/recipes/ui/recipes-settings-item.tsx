import { cn } from "@/shared/lib/css";
import { Switch } from "@/shared/ui/kit/switch";
import { Text } from "@/shared/ui/kit/text";

export function RecipesSettingsItem({
  className,
  title,
  description,
  checked = false,
  onToggle,
  badge,
  isEditable = true,
}: {
  className?: string;
  title: string;
  description: string;
  checked?: boolean;
  onToggle?: (checked: boolean) => void;
  badge?: React.ReactNode;
  isEditable?: boolean;
}) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <label className="flex items-center justify-between">
        <Text>{title}</Text>

        {badge ? (
          badge
        ) : (
          <Switch
            checked={checked}
            onCheckedChange={onToggle}
            disabled={!isEditable}
          />
        )}
      </label>

      <Text variant="label" color="secondary">
        {description}
      </Text>
    </div>
  );
}
