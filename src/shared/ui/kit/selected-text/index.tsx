import { cn } from "@/shared/lib/css";
import { Text } from "../text";

export function SelectedText({
  className,
  children,
  ...props
}: React.ComponentProps<typeof Text>) {
  return (
    <Text className={cn("relative", className)} {...props}>
      <span
        className="absolute w-full h-full inset-0 z-[-1] bg-gradient-yellow"
      />
      {children}
    </Text>
  );
}
