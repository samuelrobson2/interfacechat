import { cn, withPrefix } from "@/shared/lib/css";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { textVariants } from "../text";

const inputContainerVariants = cva(
  "relative flex gap-2 items-center transition-all w-full",
  {
    variants: {
      variant: {
        floating: "",
        labeled: "",
        plain: "",
      },
      fill: {
        default: [
          "h-16 bg-background-primary rounded-[4px] shadow-inset-default",
          "px-4 py-2 hairline [--hairline-radius:4px]",
          "has-disabled:[--hairline-color:var(--color-gray-2)]",
        ],
        outlined: [
          "bg-background-secondary hairline",
          "has-disabled:[--hairline-color:var(--color-gray-2)]",
        ],
        // Transparent hairline by default; focus/error give it a color (see compoundVariants)
        filled: ["bg-gray-6 hairline [--hairline-color:transparent]"],
        underline: "hairline-b",
      },
      shape: {
        square: "",
        rounded: "",
      },
      hasError: {
        true: "",
        false: "",
      },
    },
    compoundVariants: [
      {
        variant: "floating",
        fill: ["outlined", "filled"],
        className: "h-16 px-4 py-2",
      },
      {
        variant: ["labeled", "plain"],
        fill: ["outlined", "filled"],
        className: "h-13 px-4 py-1.5",
      },
      {
        variant: ["labeled", "plain", "floating"],
        fill: "underline",
        className: "px-0 pt-2 pb-2.5",
      },
      {
        hasError: false,
        fill: ["default", "outlined", "filled", "underline"],
        // Hairline thickens from 0.5px to 1px and turns primary on focus
        className: "has-focus:[--hairline-scale:1] has-focus:[--hairline-color:var(--color-stroke-primary)]",
      },
      {
        hasError: true,
        fill: ["default", "outlined", "filled", "underline"],
        className: "[--hairline-scale:1] [--hairline-color:var(--color-red-5)]",
      },
      {
        fill: "filled",
        variant: "floating",
        className: "has-disabled:opacity-50",
      },
      {
        shape: "square",
        fill: ["outlined", "filled"],
        className: "rounded-[4px] [--hairline-radius:4px]",
      },
      {
        variant: "floating",
        shape: "rounded",
        fill: ["outlined", "filled"],
        className: "rounded-[20px] [--hairline-radius:20px]",
      },
      {
        variant: ["labeled", "plain"],
        shape: "rounded",
        fill: ["outlined", "filled"],
        className: "rounded-[52px] [--hairline-radius:52px]",
      },
    ],
    defaultVariants: {
      variant: "floating",
      fill: "default",
      shape: "square",
      hasError: false,
    },
  },
);

const inputFieldVariants = cva(
  [
    textVariants({ variant: "body", color: "primary" }),
    "peer flex-1 outline-none w-full bg-transparent",
    "disabled:cursor-not-allowed disabled:text-gray-2",
    "selection:bg-ring selection:text-white",
  ],
  {
    variants: {
      variant: {
        floating: "pt-5 pb-0 placeholder:text-transparent",
        labeled: ["py-0", withPrefix("placeholder", textVariants({ variant: "label", color: "secondary" }))],
        plain: ["py-0", withPrefix("placeholder", textVariants({ variant: "label", color: "secondary" }))],
      },
    },
    defaultVariants: {
      variant: "floating",
    },
  },
);

export interface InputProps
  extends Omit<React.ComponentProps<"input">, "className" | "ref">,
    Pick<VariantProps<typeof inputContainerVariants>, "variant" | "shape" | "fill"> {
  className?: string;
  wrapperClassName?: string;
  inputClassName?: string;
  labelClassName?: string;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
  label?: string;
  error?: string | React.ReactNode;
  isError?: boolean;
  inputRef?: React.Ref<HTMLInputElement>;
  ref?: React.Ref<HTMLDivElement>;
}

const Input = ({
  className,
  wrapperClassName,
  inputClassName,
  labelClassName,
  type,
  label,
  error,
  isError,
  id,
  leftElement,
  rightElement,
  ref,
  inputRef,
  variant = "floating",
  fill = "default",
  shape = "square",
  disabled,
  placeholder,
  ...props
}: InputProps) => {
  const generatedId = React.useId();
  const inputId = id || generatedId;

  const isFloating = variant === "floating";
  const isLabeled = variant === "labeled";
  const hasError = !!(error || isError);

  return (
    <div
      ref={ref}
      className={cn(
        "flex flex-col gap-1 w-full",
        fill !== "default" && !isFloating && disabled && "opacity-50",
        wrapperClassName,
      )}
    >
      {/* Static label above the input (labeled variant only) */}
      {isLabeled && label && (
        <label
          htmlFor={inputId}
          className={cn(
            textVariants({ variant: "label", color: "secondary" }),
            "px-4",
            disabled && "text-gray-2!",
            labelClassName,
          )}
        >
          {label}
        </label>
      )}

      {/* Input container */}
      <div
        className={cn(
          inputContainerVariants({
            variant,
            fill,
            shape,
            hasError,
          }),
          className,
        )}
      >
        {leftElement}

        <input
          ref={inputRef}
          id={inputId}
          type={type}
          disabled={disabled}
          placeholder={isFloating ? " " : placeholder || ""}
          className={cn(inputFieldVariants({ variant }), inputClassName)}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />

        {rightElement}

        {/* Floating label (animates from center to top on focus) */}
        {isFloating && label && (
          <label
            htmlFor={inputId}
            className={cn(
              "absolute left-4 top-1/2 -translate-y-1/2 transition-all pointer-events-none",
              "text-typography-secondary font-light text-base leading-6",
              "peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-sm peer-focus:leading-5",
              "peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:translate-y-0",
              "peer-[:not(:placeholder-shown)]:text-sm peer-[:not(:placeholder-shown)]:leading-5",
              "peer-disabled:text-gray-2",
              labelClassName,
            )}
          >
            {label}
          </label>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p
          id={`${inputId}-error`}
          className={cn(
            textVariants({ variant: "label", color: "error" }),
            "text-left",
            fill !== "default" && fill !== "underline" && !isFloating && "px-4",
          )}
        >
          {error}
        </p>
      )}
    </div>
  );
};

export { Input, inputContainerVariants, inputFieldVariants };
