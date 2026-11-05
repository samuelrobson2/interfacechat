import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/shared/lib/css";
import { ChevronBottomIcon } from "../../../assets/icons/outlined/ChevronBottom";
import { textVariants } from "../text";

function NavigationMenu({
  className,
  children,
  viewport = true,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Root> & {
  viewport?: boolean;
}) {
  return (
    <NavigationMenuPrimitive.Root
      data-slot="navigation-menu"
      data-viewport={viewport}
      className={cn(
        "group/navigation-menu relative flex max-w-max flex-1 items-center justify-center",
        className,
      )}
      {...props}
    >
      {children}
      {viewport && <NavigationMenuViewport />}
    </NavigationMenuPrimitive.Root>
  );
}

function NavigationMenuList({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.List>) {
  return (
    <NavigationMenuPrimitive.List
      data-slot="navigation-menu-list"
      className={cn(
        "group flex flex-1 list-none items-center gap-4",
        className,
      )}
      {...props}
    />
  );
}

function NavigationMenuItem({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Item>) {
  return (
    <NavigationMenuPrimitive.Item
      data-slot="navigation-menu-item"
      className={cn("relative", className)}
      {...props}
    />
  );
}

const navigationMenuTriggerVariants = cva(
  [
    textVariants({ variant: "body", color: "primary" }),
    "group inline-flex items-center justify-center gap-1 whitespace-nowrap cursor-pointer",
    "h-8 px-1.5 py-1",
    "transition-colors outline-none",
    "disabled:pointer-events-none disabled:opacity-40",
  ],
  {
    variants: {
      state: {
        default: "",
        active: "bg-gray-6 rounded-[4px]",
      },
    },
    defaultVariants: {
      state: "default",
    },
  },
);

function NavigationMenuTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Trigger>) {
  return (
    <NavigationMenuPrimitive.Trigger
      data-slot="navigation-menu-trigger"
      className={cn(
        navigationMenuTriggerVariants(),
        "hover:bg-gray-6 hover:rounded-[4px]",
        "data-[state=open]:bg-gray-6 data-[state=open]:rounded-[4px]",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronBottomIcon
        className="size-4 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180"
        pathClasses="stroke-current"
      />
    </NavigationMenuPrimitive.Trigger>
  );
}

function NavigationMenuContent({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Content>) {
  return (
    <NavigationMenuPrimitive.Content
      data-slot="navigation-menu-content"
      className={cn(
        "top-0 left-0 w-full shadow-inset-default min-w-[220px]",
        "flex flex-col gap-[2px] p-[4px]",
        "data-[motion^=from-]:animate-in data-[motion^=from-]:fade-in",
        "data-[motion^=to-]:animate-out data-[motion^=to-]:fade-out",
        "data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52",
        "data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52",
        "md:absolute md:w-auto",
        // Non-viewport mode
        "group-data-[viewport=false]/navigation-menu:top-full group-data-[viewport=false]/navigation-menu:mt-1",
        "group-data-[viewport=false]/navigation-menu:overflow-hidden",
        "group-data-[viewport=false]/navigation-menu:rounded-[4px]",
        "group-data-[viewport=false]/navigation-menu:border group-data-[viewport=false]/navigation-menu:border-stroke-secondary",
        "group-data-[viewport=false]/navigation-menu:bg-gray-1/10",
        "group-data-[viewport=false]/navigation-menu:duration-200",
        "group-data-[viewport=false]/navigation-menu:data-[state=closed]:animate-out group-data-[viewport=false]/navigation-menu:data-[state=closed]:fade-out-0 group-data-[viewport=false]/navigation-menu:data-[state=closed]:zoom-out-95",
        "group-data-[viewport=false]/navigation-menu:data-[state=open]:animate-in group-data-[viewport=false]/navigation-menu:data-[state=open]:fade-in-0 group-data-[viewport=false]/navigation-menu:data-[state=open]:zoom-in-95",
        className,
      )}
      {...props}
    />
  );
}

function NavigationMenuViewport({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Viewport>) {
  return (
    <div className="absolute top-full left-0 isolate z-50 flex justify-center">
      <NavigationMenuPrimitive.Viewport
        data-slot="navigation-menu-viewport"
        className={cn(
          "origin-top-center relative mt-1",
          "h-(--radix-navigation-menu-viewport-height) w-full overflow-hidden",
          "rounded-[4px] border border-stroke-secondary bg-gray-1/10",
          "data-[state=closed]:animate-out data-[state=closed]:zoom-out-95",
          "data-[state=open]:animate-in data-[state=open]:zoom-in-90",
          "md:w-(--radix-navigation-menu-viewport-width)",
          className,
        )}
        {...props}
      />
    </div>
  );
}

const navigationMenuLinkVariants = cva(
  [
    "transition-colors outline-none cursor-pointer",
    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  ],
  {
    variants: {
      // "content" — inside NavigationMenuContent (dropdown item with title + description)
      // "inline" — direct NavigationMenuItem child (same look as trigger)
      variant: {
        content: [
          "flex flex-col gap-0 rounded-[4px] p-3 w-full",
          "hover:bg-gray-6 focus:bg-gray-6",
        ],
        inline: [
          textVariants({ variant: "body", color: "primary" }),
          "inline-flex items-center h-8 px-1.5 py-1 rounded-[4px] whitespace-nowrap",
          "hover:bg-gray-6 focus:bg-gray-6",
        ],
      },
    },
    defaultVariants: {
      variant: "content",
    },
  },
);

type NavigationMenuLinkProps = React.ComponentProps<
  typeof NavigationMenuPrimitive.Link
> &
  VariantProps<typeof navigationMenuLinkVariants>;

function NavigationMenuLink({
  className,
  variant,
  ...props
}: NavigationMenuLinkProps) {
  return (
    <NavigationMenuPrimitive.Link
      data-slot="navigation-menu-link"
      className={cn(navigationMenuLinkVariants({ variant }), className)}
      {...props}
    />
  );
}

function NavigationMenuIndicator({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Indicator>) {
  return (
    <NavigationMenuPrimitive.Indicator
      data-slot="navigation-menu-indicator"
      className={cn(
        "top-full z-1 flex h-1.5 items-end justify-center overflow-hidden",
        "data-[state=hidden]:animate-out data-[state=hidden]:fade-out",
        "data-[state=visible]:animate-in data-[state=visible]:fade-in",
        className,
      )}
      {...props}
    >
      <div className="relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm bg-stroke-secondary shadow-md" />
    </NavigationMenuPrimitive.Indicator>
  );
}

export {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  navigationMenuLinkVariants,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerVariants,
  NavigationMenuViewport,
};
