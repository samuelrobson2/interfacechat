import { BuildIcon } from "@/shared/assets/icons/general/Build";
import { DashboardIcon } from "@/shared/assets/icons/general/Dashboard";
import { ROUTES } from "@/shared/model/routes";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/shared/ui/kit/breadcrumb";
import { textVariants } from "@/shared/ui/kit/text";
import { Fragment } from "react";
import { Link, type To } from "react-router-dom";

export type AppBreadcrumbItem = {
  label: string;
  to?: To;
};

export type AppBreadcrumbRoot = keyof typeof ROOT_CRUMBS;

const ROOT_CRUMBS = {
  home: {
    to: ROUTES.HOME,
    label: "Home",
    icon: (
      <BuildIcon
        svgClasses="size-5"
        pathClasses="stroke-icon-secondary [&:nth-of-type(2)]:stroke-none [&:nth-of-type(2)]:fill-icon-secondary"
      />
    ),
  },
  datasets: {
    to: ROUTES.DATASETS,
    label: "Dashboard",
    icon: (
      <DashboardIcon svgClasses="size-5" pathClasses="fill-icon-secondary" />
    ),
  },
} as const;

const separatorClassName = textVariants({
  variant: "label",
  color: "secondary",
});

const crumbClassName = "block max-w-[220px] truncate";

/**
 * App-wide breadcrumb trail. The root crumb is rendered from a preset, so pages
 * only pass the crumbs below it.
 */
export function AppBreadcrumb({
  items,
  root = "home",
  className,
  ...props
}: Omit<React.ComponentProps<"nav">, "children"> & {
  items: AppBreadcrumbItem[];
  root?: AppBreadcrumbRoot;
}) {
  const rootCrumb = ROOT_CRUMBS[root];

  return (
    <Breadcrumb className={className} {...props}>
      <BreadcrumbList className="gap-2">
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link
              to={rootCrumb.to}
              aria-label={rootCrumb.label}
              title={rootCrumb.label}
              className="p-0.5"
            >
              {rootCrumb.icon}
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {items.map((item, index) => (
          <Fragment key={`${index}-${item.label}`}>
            <BreadcrumbSeparator className={separatorClassName}>
              /
            </BreadcrumbSeparator>

            <BreadcrumbItem>
              {item.to ? (
                <BreadcrumbLink asChild>
                  <Link
                    to={item.to}
                    title={item.label}
                    className={crumbClassName}
                  >
                    {item.label}
                  </Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage title={item.label} className={crumbClassName}>
                  {item.label}
                </BreadcrumbPage>
              )}
            </BreadcrumbItem>
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
