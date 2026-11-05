import { type ChangeEvent, type ComponentProps } from "react";
import { cn } from "@/shared/lib/css";
import { Input } from "@/shared/ui/kit/input";
import { useNumericTicker } from "../model/use-numeric-ticker";

type FinetuneHyperparametersAdaptedTextInputProps = {
  value: string;
  onChange: (value: string) => void;
  isError?: boolean;
  useTicker?: boolean;
  className?: string;
  bold?: boolean;
} & Pick<ComponentProps<"input">, "aria-label" | "placeholder" | "disabled">;

export function FinetuneHyperparametersAdaptedTextInput({
  value,
  onChange,
  isError,
  useTicker = false,
  className,
  "aria-label": ariaLabel,
  placeholder,
  disabled,
  bold,
}: FinetuneHyperparametersAdaptedTextInputProps) {
  const { displayValue, handleUserInteraction } = useNumericTicker({
    value,
    enabled: useTicker,
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleUserInteraction();
    onChange(e.target.value);
  };

  return (
    <Input
      type="text"
      variant="plain"
      fill="default"
      shape="square"
      value={displayValue}
      onChange={handleChange}
      onFocus={handleUserInteraction}
      disabled={disabled}
      isError={isError}
      placeholder={placeholder}
      aria-label={ariaLabel}
      aria-invalid={isError || undefined}
      wrapperClassName="w-full min-w-0 gap-0"
      className={cn(
        "h-[52px] min-h-[52px] shadow-inset-default",
        !isError && "border-blue-4",
        className,
      )}
      inputClassName={cn(
        "min-w-0 text-center tabular-nums font-mono leading-[1]",
        bold && "font-bold",
      )}
    />
  );
}
