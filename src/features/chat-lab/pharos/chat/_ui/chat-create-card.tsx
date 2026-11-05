import { Link } from "react-router-dom";
import { PlusSmallIcon } from "@/shared/assets/icons/outlined/PlusSmall";
import { cn } from "@/shared/lib/css";
import { Text } from "@/shared/ui/kit/text";
import { SurfaceFrame } from "@/shared/ui/surface-frame";

const CONTENT_CLASS = "flex flex-col justify-between p-4 text-left outline-none";

export function ChatCreateCard({
  to,
  title,
  ariaLabel,
  onClick,
  className,
}: {
  to?: string;
  title: string;
  ariaLabel?: string;
  onClick?: () => void;
  className?: string;
}) {
  const label = ariaLabel ?? title;
  const content = (
    <>
      <Text variant="label" color="secondary" className="line-clamp-3">
        {title}
      </Text>

      <div className="flex justify-end">
        <PlusSmallIcon svgClasses="size-4" />
      </div>
    </>
  );

  return (
    <SurfaceFrame asChild gradientStroke="hover" className={className}>
      {to ? (
        <Link to={to} aria-label={label} className={CONTENT_CLASS}>
          {content}
        </Link>
      ) : (
        <button
          type="button"
          aria-label={label}
          onClick={onClick}
          className={cn(CONTENT_CLASS, "cursor-pointer")}
        >
          {content}
        </button>
      )}
    </SurfaceFrame>
  );
}
