import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/shared/lib/css";
import { Skeleton } from "../skeleton";
import { textVariants } from "../text";
import { Slot } from "@radix-ui/react-slot";

const cardVariants = cva("flex", {
  variants: {
    variant: {
      default: [
        "bg-background-primary shadow-inset-default",
        "hairline gap-6",
      ],
      ghost: "gap-3 overflow-hidden",
      outlined: "bg-gray-1/10 hairline gap-3",
      filled: "bg-gray-6 gap-3 overflow-hidden",
    },
    shape: {
      square: "rounded-[4px] [--hairline-radius:4px]",
      rounded: "rounded-[24px] [--hairline-radius:24px]",
    },
    orientation: {
      vertical: "flex-col",
      horizontal: "flex-row items-start",
    },
    spacing: {
      none: "",
      md: "p-4",
    },
  },
  defaultVariants: {
    variant: "default",
    shape: "square",
    orientation: "vertical",
    spacing: "md",
  },
});

function Card({
  className,
  asChild,
  highlight = false,
  variant,
  shape,
  orientation,
  spacing,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof cardVariants> & {
    asChild?: boolean;
    highlight?: boolean;
  }) {
  const Comp = asChild ? Slot : "div";

  return (
    <Comp
      data-slot="card"
      className={cn(
        cardVariants({ variant, shape, orientation, spacing }),
        highlight && "shadow-inset-highlight [--hairline-color:var(--color-blue-4)]",
        className,
      )}
      {...props}
    />
  );
}

const cardImageVariants = cva("w-full h-full shrink-0 overflow-hidden object-fill", {
  variants: {
    ratio: {
      landscape: "aspect-video",
      square: "aspect-square",
      portrait: "aspect-[3/4]",
    },
    shape: {
      square: "",
      rounded: "rounded-[24px]",
    },
  },
  defaultVariants: {
    ratio: "landscape",
    shape: "square",
  },
});

function CardImage({
  className,
  ratio,
  shape,
  alt = "",
  isLoading,
  ...props
}: React.ComponentProps<"img"> &
  VariantProps<typeof cardImageVariants> & {
    isLoading?: boolean;
  }) {
  if (isLoading) {
    return (
      <Skeleton
        data-slot="card-image"
        className={cn(cardImageVariants({ ratio, shape }), className)}
        style={props.style}
      />
    );
  }

  return (
    <img
      data-slot="card-image"
      alt={alt}
      className={cn(cardImageVariants({ ratio, shape }), className)}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header flex gap-2 items-center",
        className,
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn(textVariants({ variant: "body" }), className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn(
        textVariants({ variant: "body", color: "secondary" }),
        className,
      )}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className,
      )}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("flex", className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center", className)}
      {...props}
    />
  );
}

export {
  Card,
  cardVariants,
  CardImage,
  cardImageVariants,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};
