import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/shared/lib/css";
import { textVariants } from "../text";

type TabsVariantContextValue = {
  variant: "underline" | "solid" | "pill" | "segment";
  color: "default" | "blue";
  size: "lg" | "md";
};

const TabsVariantContext = React.createContext<TabsVariantContextValue>({
  variant: "underline",
  color: "default",
  size: "lg",
});

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  );
}

const tabsListVariants = cva("inline-flex items-center h-10", {
  variants: {
    variant: {
      underline: "w-full justify-center",
      solid: "bg-gray-6 p-[2px] rounded-[4px]",
      pill: "bg-gray-6 p-[2px] rounded-[52px]",
      segment:
        "gap-[2px] rounded-[32px] bg-background-primary p-1 hairline [--hairline-color:var(--color-gray-2)] [--hairline-radius:32px]",
    },
  },
  defaultVariants: {
    variant: "underline",
  },
});

type TabsListProps = React.ComponentProps<typeof TabsPrimitive.List> &
  VariantProps<typeof tabsListVariants> & {
    color?: "default" | "blue";
    size?: "lg" | "md";
  };

function TabsList({
  className,
  variant = "underline",
  color = "default",
  size = "lg",
  ...props
}: TabsListProps) {
  const contextValue = React.useMemo<TabsVariantContextValue>(
    () => ({
      variant: variant ?? "underline",
      color: color ?? "default",
      size: size ?? "lg",
    }),
    [variant, color, size],
  );

  return (
    <TabsVariantContext.Provider value={contextValue}>
      <TabsPrimitive.List
        data-slot="tabs-list"
        className={cn(tabsListVariants({ variant }), className)}
        {...props}
      />
    </TabsVariantContext.Provider>
  );
}

const tabsTriggerVariants = cva(
  [
    "w-full inline-flex items-center justify-center whitespace-nowrap cursor-pointer",
    "text-typography-secondary",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-40",
    "disabled:data-[state=active]:pointer-events-none disabled:data-[state=active]:opacity-40",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ],
  {
    variants: {
      variant: {
        underline: [
          "hairline-b",
          "data-[state=active]:[--hairline-scale:2]",
          "data-[state=active]:text-typography-primary",
        ],
        solid: ["rounded-[3px]", "data-[state=active]:text-typography-inverse"],
        pill: ["rounded-[43px]", "data-[state=active]:text-typography-inverse"],
        segment: [
          "rounded-[60px]",
          "data-[state=active]:bg-gray-6",
          "data-[state=active]:text-typography-primary",
        ],
      },
      // lg = STK/Title (20), md = STK/Body (16)
      size: {
        lg: textVariants({ variant: "title", color: "none" }),
        md: textVariants({ variant: "body", color: "none" }),
      },
      color: {
        default: "",
        blue: "",
      },
    },
    compoundVariants: [
      // Underline padding per size
      { variant: "underline", size: "lg", className: "pt-3 pb-5" },
      { variant: "underline", size: "md", className: "pt-2 pb-4" },

      // Solid + Pill share the same padding
      { variant: ["solid", "pill"], size: "lg", className: "px-3 py-2" },
      { variant: ["solid", "pill"], size: "md", className: "px-3 py-[6px]" },

      // Segment padding per size
      { variant: "segment", size: "lg", className: "px-3 py-2" },
      { variant: "segment", size: "md", className: "px-3 py-1.5" },

      // Underline active border color (drives the hairline pseudo-element)
      { variant: "underline", color: "default", className: "data-[state=active]:[--hairline-color:var(--color-stroke-primary)]" },
      { variant: "underline", color: "blue", className: "data-[state=active]:[--hairline-color:var(--color-blue-5)]" },

      // Solid + Pill active background
      { variant: ["solid", "pill"], color: "default", className: "data-[state=active]:bg-gradient-black-blue" },
      { variant: ["solid", "pill"], color: "blue", className: "data-[state=active]:bg-blue-5" },
    ],
    defaultVariants: {
      variant: "underline",
      size: "lg",
      color: "default",
    },
  },
);

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  const { variant, color, size } = React.useContext(TabsVariantContext);

  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(tabsTriggerVariants({ variant, color, size }), className)}
      {...props}
    />
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn(
        "flex-1 outline-none overflow-y-auto no-scrollbar",
        className,
      )}
      {...props}
    />
  );
}

export {
  Tabs,
  TabsList,
  tabsListVariants,
  TabsTrigger,
  tabsTriggerVariants,
  TabsContent,
};
