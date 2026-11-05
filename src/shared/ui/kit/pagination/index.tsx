import * as React from "react";

import { ChevronLeftIcon } from "@/shared/assets/icons/outlined/ChevronLeft";
import { ChevronRightIcon } from "@/shared/assets/icons/outlined/ChevronRight";
import { cn } from "@/shared/lib/css";
import { cva, type VariantProps } from "class-variance-authority";
import { textVariants } from "../text";

const paginationItemVariants = cva(
  [
    "size-[32px] flex items-center justify-center",
    "border border-stroke-secondary",
    "bg-background-primary shadow-inset-default",
    "cursor-pointer transition-colors",
    "hover:border-stroke-primary",
    textVariants({ variant: "label" }),
  ],
  {
    variants: {
      shape: {
        default: "rounded-[8px]",
        circle: "rounded-[32px]",
      },
    },
    defaultVariants: {
      shape: "default",
    },
  },
);

type PaginationItemShape = VariantProps<typeof paginationItemVariants>;

function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  );
}

function PaginationContent({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex flex-row items-center gap-[5px]", className)}
      {...props}
    />
  );
}

function PaginationItem({ ...props }: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />;
}

type PaginationLinkProps = {
  isActive?: boolean;
} & PaginationItemShape &
  React.ComponentProps<"a">;

function PaginationLink({
  className,
  isActive,
  shape,
  ...props
}: PaginationLinkProps) {
  return (
    <a
      aria-current={isActive ? "page" : undefined}
      data-slot="pagination-link"
      data-active={isActive}
      className={cn(
        paginationItemVariants({ shape }),
        isActive &&
          "bg-blue-5 text-gray-0 border-transparent shadow-none hover:border-transparent",
        className,
      )}
      {...props}
    />
  );
}

function PaginationPrevious({
  className,
  disabled,
  shape,
  ...props
}: Omit<PaginationLinkProps, "children"> & { disabled?: boolean }) {
  return (
    <a
      aria-label="Go to previous page"
      aria-disabled={disabled}
      data-slot="pagination-link"
      className={cn(
        paginationItemVariants({ shape }),
        disabled && "pointer-events-none",
        className,
      )}
      {...props}
    >
      <ChevronLeftIcon
        className="size-4"
        pathClasses={disabled ? "stroke-gray-2" : "stroke-icon-primary"}
      />
    </a>
  );
}

function PaginationNext({
  className,
  disabled,
  shape,
  ...props
}: Omit<PaginationLinkProps, "children"> & { disabled?: boolean }) {
  return (
    <a
      aria-label="Go to next page"
      aria-disabled={disabled}
      data-slot="pagination-link"
      className={cn(
        paginationItemVariants({ shape }),
        disabled && "pointer-events-none",
        className,
      )}
      {...props}
    >
      <ChevronRightIcon
        className="size-4"
        pathClasses={disabled ? "stroke-gray-2" : "stroke-icon-primary"}
      />
    </a>
  );
}

function PaginationEllipsis({
  className,
  shape,
  ...props
}: React.ComponentProps<"span"> & PaginationItemShape) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn(
        paginationItemVariants({ shape }),
        "hover:border-stroke-secondary cursor-default",
        className,
      )}
      {...props}
    >
      ...
      <span className="sr-only">More pages</span>
    </span>
  );
}

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
  paginationItemVariants,
};
