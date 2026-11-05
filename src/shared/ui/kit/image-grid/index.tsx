import { cn } from "@/shared/lib/css";
import { Text } from "@/shared/ui/kit/text";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

const imageGridColumnGapVariants = cva("w-full", {
  variants: {
    columnGap: {
      sm: "[column-gap:12px]",
      md: "[column-gap:16px]",
      lg: "[column-gap:20px]",
    },
  },
  defaultVariants: {
    columnGap: "md",
  },
});

const ROW_GAP_VALUES = { sm: "16px", md: "20px", lg: "24px" } as const;
type RowGap = keyof typeof ROW_GAP_VALUES;

function ImageGrid({
  className,
  columns = 3,
  columnGap,
  rowGap = "lg",
  style,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof imageGridColumnGapVariants> & {
    columns?: number;
    rowGap?: RowGap;
  }) {
  return (
    <div
      data-slot="image-grid"
      style={{
        columnCount: columns,
        ["--image-grid-row-gap" as string]: ROW_GAP_VALUES[rowGap],
        ...style,
      }}
      className={cn(imageGridColumnGapVariants({ columnGap }), className)}
      {...props}
    />
  );
}

function ImageGridItem({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="image-grid-item"
      className={cn(
        "flex flex-col gap-3 break-inside-avoid mb-(--image-grid-row-gap,24px)",
        className,
      )}
      {...props}
    />
  );
}

const imageGridItemImageVariants = cva("w-full object-cover", {
  variants: {
    orientation: {
      landscape: "aspect-video",
      square: "aspect-square",
      portrait: "aspect-[3/4]",
    },
  },
  defaultVariants: {
    orientation: "square",
  },
});

function ImageGridItemImage({
  className,
  orientation,
  alt = "",
  ...props
}: React.ComponentProps<"img"> &
  VariantProps<typeof imageGridItemImageVariants>) {
  return (
    <img
      data-slot="image-grid-item-image"
      alt={alt}
      className={cn(imageGridItemImageVariants({ orientation }), className)}
      {...props}
    />
  );
}

function ImageGridItemCaption({
  className,
  title,
  description,
  ...props
}: React.ComponentProps<"div"> & {
  title?: React.ReactNode;
  description?: React.ReactNode;
}) {
  return (
    <div
      data-slot="image-grid-item-caption"
      className={cn("flex flex-col", className)}
      {...props}
    >
      {title && <Text variant="title">{title}</Text>}
      {description && (
        <Text variant="label" color="secondary">
          {description}
        </Text>
      )}
    </div>
  );
}

export { ImageGrid, ImageGridItem, ImageGridItemCaption, ImageGridItemImage };
