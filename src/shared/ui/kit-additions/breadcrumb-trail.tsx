import { Fragment } from "react";
import { Link } from "react-router-dom";

import { DashboardIcon } from "@/shared/assets/icons/general/Dashboard";
import { ArrowLeftIcon } from "@/shared/assets/icons/outlined/ArrowLeft";
import { cn } from "@/shared/lib/css";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/shared/ui/kit/breadcrumb";
import { textVariants } from "@/shared/ui/kit/text";
import { ROUTES } from "@/shared/model/routes";
import { ChangingText } from "./changing-text";

/** One hop in the trail. A crumb without `to` renders as plain (unlinked) text. */
export type BreadcrumbTrailItem = {
  id: string;
  label: string;
  to?: string;
};

/**
 * How big the trail runs — one size per structural role, so there's never a
 * judgement call about which to reach for.
 *
 * `trail` (16) sits above a page's content as secondary navigation, quiet by
 * design. `title` (40) is for pages where the trail *is* the heading — the
 * dataset dashboard, whose h1 is the dataset name — so it stands in for the
 * title rather than sitting above it.
 *
 * Resist adding a third. An earlier pass carried both a 16 and an 18 with no
 * role to tell them apart, which just made the choice arbitrary.
 */
export type BreadcrumbTrailSize = "trail" | "title";

// `color: "none"` so each size contributes only its type scale — the crumbs keep
// the primary/secondary colours the kit's own link and page slots set.
const SIZES = {
  trail: {
    type: textVariants({ variant: "body", color: "none" }),
    icon: "size-5",
    arrow: "size-5",
    list: "gap-2",
    // Tight enough that a long dataset name actually truncates: the longest of
    // them measures ~280px at this size, so anything looser lets it through
    // whole and one crumb ends up dominating the trail.
    label: "max-w-[220px]",
    ellipsis: "w-6",
  },
  title: {
    type: textVariants({ variant: "h1", color: "none" }),
    icon: "size-9",
    arrow: "size-7",
    list: "gap-3",
    label: "max-w-[520px]",
    ellipsis: "w-10 [&_svg]:size-8",
  },
} satisfies Record<BreadcrumbTrailSize, Record<string, string>>;

/**
 * The full path from the Dashboard to where you are: the Dashboard icon (the
 * root, shown as its sidebar glyph rather than its name — pass `root={false}`
 * to leave it out), then every page between it and the current one — the last
 * item, rendered as the non-clickable current page. Hops are divided by slashes.
 *
 * When the trail is deeper than `maxVisible`, the crumbs after the root collapse
 * into a "…" and the tail is kept — hovering (or tabbing into) the trail
 * expands it back to every hop. The expansion is pure CSS on a `group/trail`
 * so there's no state to manage and no layout thrash on the first hover.
 *
 * A crumb whose label changes while the trail is on screen animates the swap
 * (see `ChangingText`) — so re-pointing the page at something else is visible
 * up here, not just wherever it was picked.
 */
export function BreadcrumbTrail({
  items,
  /** How many crumbs to keep visible after the root before collapsing the rest. */
  maxVisible = 3,
  size = "trail",
  rootTo = ROUTES.DATASETS,
  root = true,
  className,
  listClassName,
}: {
  items: BreadcrumbTrailItem[];
  maxVisible?: number;
  size?: BreadcrumbTrailSize;
  /** Where the root glyph links. Defaults to the Dashboard (the datasets list). */
  rootTo?: string;
  /**
   * Draw the root glyph (and, for a one-hop trail, the back arrow) ahead of the
   * crumbs. Off where the workspace's home is already a click away in its own
   * menu, so the glyph would only repeat it — Vision's trail is crumbs only.
   */
  root?: boolean;
  className?: string;
  listClassName?: string;
}) {
  const scale = SIZES[size];
  const hiddenCount = Math.max(0, items.length - maxVisible);
  const collapsed = items.slice(0, hiddenCount);
  const visible = items.slice(hiddenCount);

  // Shown when the trail is folded, swapped out for the real crumbs on hover.
  const foldedOnly = "group-hover/trail:hidden group-focus-within/trail:hidden";
  // The mirror: hidden while folded, revealed alongside the rest on hover.
  const expandedOnly =
    "hidden group-hover/trail:flex group-focus-within/trail:flex";

  // Every form truncates: a dataset name can run to 40 characters, and the
  // bigger the type the sooner it would otherwise push the rest off the line.
  const labelClassName = cn("block truncate", scale.type, scale.label);

  const renderCrumb = (item: BreadcrumbTrailItem, isCurrent: boolean) => {
    const label = <ChangingText text={item.label} />;
    if (isCurrent || !item.to) {
      return <BreadcrumbPage className={labelClassName}>{label}</BreadcrumbPage>;
    }
    return (
      <BreadcrumbLink asChild className={labelClassName}>
        <Link to={item.to}>{label}</Link>
      </BreadcrumbLink>
    );
  };

  const separator = (extraClassName?: string) => (
    <BreadcrumbSeparator className={extraClassName}>
      <span
        className={cn(
          scale.type,
          "text-typography-secondary select-none",
          // The slash leans away from the text either side of it, so it needs
          // less room than the chevron it replaced.
          size === "title" ? "px-0.5" : "",
        )}
      >
        /
      </span>
    </BreadcrumbSeparator>
  );

  // Nothing behind the current page but the root: a trail of one hop tells you
  // no more than a back arrow does, so it collapses to one. The label still
  // truncates — it's the page's own name and can be long.
  if (items.length === 1 && items[0]) {
    const only = items[0];
    return (
      <Breadcrumb className={cn("group/trail", className)}>
        <BreadcrumbList
          className={cn("flex-nowrap", scale.list, listClassName)}
        >
          {root && (
            <BreadcrumbItem>
              <BreadcrumbLink asChild className="flex items-center p-0.5">
                <Link
                  to={rootTo}
                  aria-label="Back to Dashboard"
                  title="Dashboard"
                >
                  <ArrowLeftIcon
                    className={cn("shrink-0", scale.arrow)}
                    pathClasses="stroke-current"
                  />
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
          )}
          <BreadcrumbItem className="min-w-0">
            <BreadcrumbPage className={labelClassName}>
              <ChangingText text={only.label} />
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  return (
    <Breadcrumb className={cn("group/trail", className)}>
      <BreadcrumbList className={cn("flex-nowrap", scale.list, listClassName)}>
        {root && (
          <BreadcrumbItem>
            <BreadcrumbLink
              asChild
              className="flex items-center rounded-[6px] p-0.5"
            >
              <Link to={rootTo} aria-label="Dashboard" title="Dashboard">
                {/* fill-current, so BreadcrumbLink's own secondary → primary
                    hover carries the glyph to black with it. */}
                <DashboardIcon
                  svgClasses={cn("shrink-0", scale.icon)}
                  pathClasses="fill-current"
                />
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
        )}

        {root && items.length > 0 && separator()}

        {hiddenCount > 0 && (
          <>
            <BreadcrumbItem className={foldedOnly}>
              <BreadcrumbEllipsis
                className={cn("cursor-default", scale.ellipsis)}
                title={`${hiddenCount} more`}
              />
            </BreadcrumbItem>
            {separator(foldedOnly)}
          </>
        )}

        {collapsed.map((item) => (
          <Fragment key={item.id}>
            <BreadcrumbItem className={cn("min-w-0", expandedOnly)}>
              {renderCrumb(item, false)}
            </BreadcrumbItem>
            {separator(expandedOnly)}
          </Fragment>
        ))}

        {visible.map((item, index) => {
          const isCurrent = index === visible.length - 1;
          return (
            <Fragment key={item.id}>
              <BreadcrumbItem className="min-w-0">
                {renderCrumb(item, isCurrent)}
              </BreadcrumbItem>
              {!isCurrent && separator()}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
