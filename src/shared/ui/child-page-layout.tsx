import { ArrowLeftIcon } from "@/shared/assets/icons/outlined/ArrowLeft";
import { cn } from "@/shared/lib/css";
import { Skeleton } from "@/shared/ui/kit/skeleton";
import { Link, useNavigate, type LinkProps } from "react-router-dom";
import { Text, type TextProps } from "./kit/text";
import { sidebarGutter } from "./sidebar-gutter";

export function ChildPageLayout({
  className,
  push = true,
  ...props
}: React.ComponentProps<"div"> & {
  /**
   * Follow the global rail as it expands. On by default here: every page built
   * on this layout is left-anchored against the rail. Pass `false` for a
   * full-bleed page that manages its own gutter. See `sidebarGutter`.
   */
  push?: boolean;
}) {
  return (
    <div
      className={cn(
        // Mobile: natural height so the whole page scrolls (no cramped inner
        // scroll area). Desktop: fixed viewport height with an inner 1fr region.
        "w-full grid grid-cols-[minmax(0,1fr)] grid-rows-[auto_auto] gap-6 px-4 pt-28 min-h-screen",
        "md:h-screen md:min-h-0 md:grid-rows-[auto_1fr] md:gap-10 md:overflow-hidden md:pt-10 md:pr-12",
        sidebarGutter({ push }),
        className,
      )}
      {...props}
    />
  );
}

export function ChildPageHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex items-center gap-3 min-w-0", className)} {...props} />
  );
}

export function ChildPageContent({ ...props }: React.ComponentProps<"div">) {
  return <div {...props} />;
}

export function ChildPageTitle({ ...props }: TextProps) {
  return <Text variant="h1" {...props} />;
}

export function ChildPageBackLink({
  className,
  to,
}: {
  className?: string;
  to?: LinkProps["to"];
}) {
  const navigate = useNavigate();
  const styles = cn(
    "size-10 cursor-pointer flex items-center justify-center",
    className,
  );
  const Icon = (
    <ArrowLeftIcon className="size-5" pathClasses="stroke-current" />
  );

  if (to) {
    return (
      <Link to={to} className={styles}>
        {Icon}
      </Link>
    );
  }

  return (
    <button type="button" className={styles} onClick={() => navigate(-1)}>
      {Icon}
    </button>
  );
}

export function ChildPageTitleSkeleton() {
  return <Skeleton className="w-[322px] h-12" />;
}
