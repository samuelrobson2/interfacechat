import { AiStarsIcon } from "@/shared/assets/icons/general/AiStars";
import { cn } from "@/shared/lib/css";
import { Text } from "@/shared/ui/kit/text";

export function CreditsValue({
  value,
  className,
  size = "default",
  ...props
}: React.ComponentProps<"div"> & {
  value: number;
  size?: "default" | "large";
}) {
  return (
    <div className={cn("flex items-center gap-2", className)} {...props}>
      <AiStarsIcon
        className={cn(
          size === "large" && "size-8",
          size === "default" && "size-6",
        )}
        pathClasses="fill-current"
      />

      {size === "large" && (
        <Text variant="title">{value.toLocaleString()}</Text>
      )}
      {size === "default" && <Text>{value.toLocaleString()}</Text>}
    </div>
  );
}
