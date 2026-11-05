import { cn, withPrefix } from "@/shared/lib/css";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import TextareaAutosize, {
  type TextareaAutosizeProps,
} from "react-textarea-autosize";
import { textVariants } from "../text";

const textareaContainerVariants = cva(
  "relative flex gap-2 items-center transition-all w-full has-[textarea:disabled]:opacity-50",
  {
    variants: {
      variant: {
        floating: "",
        plain: "",
      },
      fill: {
        default: [
          "bg-background-primary shadow-inset-default",
          "hairline",
          "has-[textarea:disabled]:[--hairline-color:var(--color-gray-2)]",
        ],
        filled: ["bg-gray-6 hairline [--hairline-color:transparent]"],
        underline: "hairline-b rounded-none",
      },
      shape: {
        square: "rounded-[4px] [--hairline-radius:4px]",
        rounded: "rounded-[24px] [--hairline-radius:24px]",
      },
      hasError: {
        true: "",
        false: "",
      },
    },
    compoundVariants: [
      {
        variant: "floating",
        fill: ["filled", "default"],
        className: "px-4 py-2",
      },
      {
        variant: "plain",
        fill: ["filled", "default"],
        className: "p-4",
      },
      {
        variant: ["floating", "plain"],
        fill: "underline",
        className: "px-0 pt-2 pb-2.5",
      },
      {
        hasError: false,
        fill: ["default", "filled", "underline"],
        className: "has-focus:[--hairline-scale:1] has-focus:[--hairline-color:var(--color-stroke-primary)]",
      },
      {
        hasError: true,
        fill: ["default", "filled", "underline"],
        className: "[--hairline-scale:1] [--hairline-color:var(--color-red-5)]",
      },
      {
        shape: ["rounded", "square"],
        fill: "underline",
        className: "rounded-none",
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

const textareaFieldVariants = cva(
  [
    textVariants({ variant: "body", color: "primary" }),
    "peer flex-1 outline-none w-full bg-transparent",
    "pr-2 -mr-2",
    "disabled:cursor-not-allowed",
    "selection:bg-ring selection:text-white",
    "[&::-webkit-scrollbar]:w-[2px]",
    "[&::-webkit-scrollbar-track]:bg-transparent",
    "[&::-webkit-scrollbar-thumb]:bg-gray-2 [&::-webkit-scrollbar-thumb]:rounded-[32px]",
  ],
  {
    variants: {
      variant: {
        floating: "mt-5 pb-0 placeholder:text-transparent",
        plain: [
          "py-0",
          withPrefix(
            "placeholder",
            textVariants({ variant: "body", color: "secondary" }),
          ),
        ],
      },
    },
    defaultVariants: {
      variant: "floating",
    },
  },
);

export interface TextareaProps
  extends Omit<TextareaAutosizeProps, "className" | "style">,
    Pick<
      VariantProps<typeof textareaContainerVariants>,
      "variant" | "shape" | "fill"
    > {
  className?: string;
  inputClassName?: string;
  wrapperClassName?: string;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
  label?: string;
  error?: string | React.ReactNode;
  isError?: boolean;
  ref?: React.Ref<HTMLTextAreaElement>;
}

const Textarea = ({
  className,
  inputClassName,
  wrapperClassName,
  label,
  error,
  isError,
  id,
  leftElement,
  rightElement,
  placeholder,
  variant = "floating",
  fill = "default",
  shape = "square",
  disabled,
  ref,
  maxRows = 4,
  ...props
}: TextareaProps) => {
  "use no memo";

  // Fallback to "plain" when floating variant has no label to maintain backward compat
  const effectiveVariant = variant === "floating" && !label ? "plain" : variant;
  const isFloating = effectiveVariant === "floating";
  const hasError = !!(error || isError);

  const generatedId = React.useId();
  const textareaId = id || generatedId;

  return (
    <div className={cn("flex flex-col gap-1 w-full", wrapperClassName)}>
      <div
        className={cn(
          textareaContainerVariants({
            variant: effectiveVariant,
            fill,
            shape,
            hasError,
          }),
          className,
        )}
      >
        {leftElement}

        <TextareaAutosize
          ref={ref}
          id={textareaId}
          disabled={disabled}
          placeholder={isFloating ? " " : (placeholder ?? "")}
          className={cn(
            textareaFieldVariants({ variant: effectiveVariant }),
            "min-h-6 overflow-y-auto resize-none",
            inputClassName,
          )}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? `${textareaId}-error` : undefined}
          maxRows={maxRows}
          {...props}
        />

        {rightElement}

        {isFloating && label && (
          <label
            htmlFor={textareaId}
            className={cn(
              "absolute top-5 transition-all pointer-events-none",
              fill === "underline" ? "left-0" : "left-4",
              "text-typography-secondary font-light text-base leading-6",
              "peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-sm peer-focus:leading-5",
              "peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:translate-y-0",
              "peer-[:not(:placeholder-shown)]:text-sm peer-[:not(:placeholder-shown)]:leading-5",
              "peer-disabled:text-gray-2",
            )}
          >
            {label}
          </label>
        )}
      </div>

      {error && (
        <p
          id={`${textareaId}-error`}
          className={cn(
            textVariants({ variant: "label", color: "error" }),
            "text-left",
            fill === "filled" && !isFloating && "px-4",
          )}
        >
          {error}
        </p>
      )}
    </div>
  );
};

export { Textarea, textareaContainerVariants, textareaFieldVariants };
