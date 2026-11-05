import { Input, type InputProps } from "@/shared/ui/kit/input";
import { Text } from "@/shared/ui/kit/text";
import { useState } from "react";

interface PhoneInputProps extends InputProps {
  countryCode: string;
  label: string;
}

export function PhoneInput({
  countryCode,
  label,
  ...props
}: PhoneInputProps) {
  const [isFocused, setIsFocused] = useState<boolean>(false);

  const hasValueOrFocused = !!props.value || isFocused;

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    props.onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    props.onBlur?.(e);
  };

  return (
    <Input
      label={hasValueOrFocused ? label : `${String(countryCode)} ${label}`}
      leftElement={
        hasValueOrFocused ? (
          <Text className="pt-5 -mr-1">{String(countryCode)}</Text>
        ) : null
      }
      {...props}
      onFocus={handleFocus}
      onBlur={handleBlur}
    />
  );
}
