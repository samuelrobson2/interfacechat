import { Link } from "react-router-dom";

import { cn } from "@/shared/lib/css";
import { Text } from "@/shared/ui/kit/text";

export function ChatHeaderBadge({
  to,
  icon,
  label,
  className,
  ...props
}: Omit<React.ComponentProps<typeof Link>, "to" | "children"> & {
  to: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      to={to}
      title={label}
      className={cn(
        "flex w-fit min-w-0 max-w-full items-center justify-center gap-1.5",
        "rounded-[8px] border border-gray-2 px-2 py-1.5",
        "cursor-pointer transition-colors duration-150 hover:bg-gray-2/50",
        "outline-none focus-visible:ring-2 focus-visible:ring-gray-2",
        className,
      )}
      {...props}
    >
      {icon}
      <Text
        variant="small"
        color="secondary"
        className="min-w-0 max-w-[160px] truncate"
      >
        {label}
      </Text>
    </Link>
  );
}
