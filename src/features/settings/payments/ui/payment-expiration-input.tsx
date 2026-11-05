import { Input, type InputProps } from "@/shared/ui/kit/input";

export const PaymentExpirationInput = ({
  onChange,
  value,
  ...props
}: Omit<InputProps, "onChange" | "value"> & {
  onChange: (value: string) => void;
  value: string;
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    const digitsOnly = inputValue.replace(/\D/g, "");
    const limitedDigits = digitsOnly.slice(0, 4);

    let formattedValue = limitedDigits;

    // Add slash after month if we have at least 2 digits
    if (limitedDigits.length >= 2) {
      const month = limitedDigits.slice(0, 2);
      const year = limitedDigits.slice(2);

      // Validate and correct month (01-12)
      let validMonth = month;
      if (parseInt(month) > 12) {
        validMonth = "12";
      } else if (parseInt(month) === 0 && month.length === 2) {
        validMonth = "01";
      }

      formattedValue = year ? `${validMonth}/${year}` : validMonth;
    }

    onChange?.(formattedValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      e.key === "Backspace" &&
      typeof value === "string" &&
      value.endsWith("/")
    ) {
      e.preventDefault();

      onChange?.(value.slice(0, -1));
    }

    props.onKeyDown?.(e);
  };

  return (
    <Input
      {...props}
      value={value}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      placeholder="MM/YY"
      maxLength={5}
      inputMode="numeric"
    />
  );
};
