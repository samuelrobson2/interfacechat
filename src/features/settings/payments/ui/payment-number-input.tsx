import { Input, type InputProps } from "@/shared/ui/kit/input";

export const PaymentNumberInput = ({
  onChange,
  ...props
}: Omit<InputProps, "onChange"> & {
  onChange: (value: string) => void;
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = e.target.value.replace(/\D/g, "");
    const limitedDigits = digitsOnly.slice(0, 16);
    const formattedValue = limitedDigits.replace(/(\d{4})(?=\d)/g, "$1 ");

    onChange(formattedValue);
  };

  return (
    <Input
      {...props}
      onChange={handleChange}
      maxLength={19}
      inputMode="numeric"
    />
  );
};
