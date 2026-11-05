import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { createContext, useContext, useId } from "react";

import { cn } from "@/shared/lib/css";
import type { CustomIconProps } from "@/shared/model/icon";
import { GradientText } from "@/shared/ui/gradient-text";

export type GradientBorderButtonColor = "ai" | "green";

type GradientBorderButtonContextValue = {
  color: GradientBorderButtonColor;
  hoverGradient: boolean;
  aiGradientId: string;
  greenGradientId: string;
};

const GradientBorderButtonContext =
  createContext<GradientBorderButtonContextValue | null>(null);

const useGradientBorderButtonContext = () => {
  const context = useContext(GradientBorderButtonContext);
  if (!context) {
    throw new Error(
      "GradientBorderButton.* must be used within <GradientBorderButton>",
    );
  }
  return context;
};

const rootVariants = cva(
  "group relative flex shrink-0 rounded-[var(--gbb-radius)] p-px",
  {
    variants: {
      size: {
        default: "h-8 [--gbb-radius:60px]",
        compact: "h-9 [--gbb-radius:18px]",
      },
    },
    defaultVariants: { size: "default" },
  },
);

const innerVariants = cva(
  "flex h-full items-center rounded-[var(--gbb-radius)] bg-background-primary",
  {
    variants: {
      size: {
        default: "w-full justify-center px-3 py-1.5",
        compact: "px-[9px]",
      },
    },
    defaultVariants: { size: "default" },
  },
);

// Layout / root: renders the gradient border, the inner fill and shares the
// active color with its children (`Icon`, `Label`) through context. The `ai`
// color reveals the gradient on hover by default; `green` stays static.
export function GradientBorderButton({
  color = "ai",
  hoverGradient,
  size,
  asChild = false,
  className,
  children,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof rootVariants> & {
    color?: GradientBorderButtonColor;
    hoverGradient?: boolean;
    asChild?: boolean;
  }) {
  const gradientId = useId();
  const aiGradientId = `${gradientId}-ai`;
  const greenGradientId = `${gradientId}-green`;

  const isGreen = color === "green";
  const resolvedHover = hoverGradient ?? !isGreen;

  const InnerComp = asChild ? Slot : "span";

  const rootClassName = cn(
    rootVariants({ size }),
    isGreen
      ? "bg-gradient-ai-saved-border drop-shadow-[0px_0px_2px_var(--color-mint-1)]"
      : "bg-gradient-ai-save-border drop-shadow-[0px_0px_2px_var(--color-rose-2)] cursor-pointer",
    resolvedHover && "hover:bg-gradient-ai-save-hover",
    className,
  );

  const content = (
    <>
      {/* Hidden defs holding the gradient strokes/fills referenced by icons. */}
      <svg aria-hidden className="pointer-events-none absolute size-0">
        <defs>
          <linearGradient id={aiGradientId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" style={{ stopColor: "var(--gradient-ai-rose)" }} />
            <stop offset="1" style={{ stopColor: "var(--gradient-ai-blue)" }} />
          </linearGradient>
          <linearGradient id={greenGradientId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" style={{ stopColor: "var(--color-green-5)" }} />
            <stop offset="1" style={{ stopColor: "var(--color-blue-3)" }} />
          </linearGradient>
        </defs>
      </svg>

      <InnerComp
        className={cn(
          innerVariants({ size }),
          resolvedHover &&
            "transition-colors duration-200 group-hover:bg-transparent",
        )}
      >
        {children}
      </InnerComp>
    </>
  );

  return (
    <GradientBorderButtonContext.Provider
      value={{
        color,
        hoverGradient: resolvedHover,
        aiGradientId,
        greenGradientId,
      }}
    >
      {asChild ? (
        <span data-slot="gradient-border-button" className={rootClassName}>
          {content}
        </span>
      ) : (
        <button
          type="button"
          data-slot="gradient-border-button"
          {...props}
          className={rootClassName}
        >
          {content}
        </button>
      )}
    </GradientBorderButtonContext.Provider>
  );
}

export function GradientBorderButtonIcon({
  icon: Icon,
  paint = "stroke",
  spin = false,
}: {
  icon: React.ComponentType<CustomIconProps>;
  paint?: "stroke" | "fill";
  spin?: boolean;
}) {
  const { color, hoverGradient, aiGradientId, greenGradientId } =
    useGradientBorderButtonContext();
  const gradientId = color === "green" ? greenGradientId : aiGradientId;
  const pathProps =
    paint === "stroke"
      ? { stroke: `url(#${gradientId})` }
      : { fill: `url(#${gradientId})` };

  return (
    <Icon
      svgClasses={cn("size-4 shrink-0", spin && "animate-spin")}
      pathProps={pathProps}
      // Idle hover fades the fill to transparent, so paint the icon solid white.
      pathClasses={
        hoverGradient
          ? paint === "stroke"
            ? "group-hover:[stroke:var(--color-gray-1)]"
            : "group-hover:[fill:var(--color-gray-1)]"
          : undefined
      }
    />
  );
}

// Label: renders its content as gradient text. Optionally collapsible with a
// width animation. The `pl-2` gap lives on the innermost node so it is clipped
// (not left as phantom padding) while collapsed.
export function GradientBorderButtonLabel({
  children,
  collapsible = false,
  expanded = true,
  className,
}: {
  children: React.ReactNode;
  collapsible?: boolean;
  expanded?: boolean;
  className?: string;
}) {
  const { color, hoverGradient } = useGradientBorderButtonContext();
  const isGreen = color === "green";

  const label = (
    <GradientText
      as="span"
      variant={isGreen ? "green" : "default"}
      animated={!isGreen}
      className={cn(
        "pl-2 text-[14px] leading-[1.2] font-light",
        // Idle hover: the fill turns transparent, so paint the text solid white.
        hoverGradient &&
          "group-hover:[-webkit-text-fill-color:var(--color-gray-1)]",
        className,
      )}
    >
      {children}
    </GradientText>
  );

  if (!collapsible) return label;

  return (
    <span
      className={cn(
        "grid transition-[grid-template-columns] duration-200 ease-out motion-reduce:transition-none",
        expanded ? "grid-cols-[1fr]" : "grid-cols-[0fr]",
      )}
    >
      <span className="min-w-0 overflow-hidden">
        <span className="block whitespace-nowrap">{label}</span>
      </span>
    </span>
  );
}
