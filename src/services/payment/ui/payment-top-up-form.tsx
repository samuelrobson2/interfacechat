import { Input } from "@/shared/ui/kit/input";
import { useCreditsPackages } from "../model/use-credits-packages";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { getNumericValue } from "@/shared/lib/js";
import { Text } from "@/shared/ui/kit/text";
import { AiStarIcon } from "@/shared/assets/icons/outlined/AiStar";
import { cn } from "@/shared/lib/css";
import { Skeleton } from "@/shared/ui/kit/skeleton";
import { useEffect } from "react";

const topUpFormSchema = z.object({
  amount: z
    .string()
    .nonempty("Amount is required")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Amount must be greater than 0",
    }),
});

type TopUpFormValues = z.infer<typeof topUpFormSchema>;

export function PaymentTopUpForm({
  className,
  onSubmit,
  disabled,
  defaultAmount,
  ...props
}: Omit<React.ComponentProps<"form">, "onSubmit"> & {
  onSubmit: (values: TopUpFormValues) => void;
  disabled?: boolean;
  defaultAmount?: number;
}) {
  "use no memo";

  const { getPrice, isLoading } = useCreditsPackages();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<TopUpFormValues>({
    resolver: zodResolver(topUpFormSchema),
    defaultValues: {
      amount: defaultAmount && defaultAmount > 0 ? defaultAmount.toString() : "",
    },
  });

  useEffect(() => {
    reset({
      amount: defaultAmount && defaultAmount > 0 ? defaultAmount.toString() : "",
    });
  }, [defaultAmount, reset]);

  const amount = watch("amount");

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numericValue = getNumericValue(e.target.value);
    setValue("amount", numericValue.toString(), { shouldValidate: true });
  };

  return (
    <form
      className={cn("flex flex-col gap-8", className)}
      onSubmit={handleSubmit(onSubmit)}
      {...props}
    >
      <Input
        label="Amount"
        error={errors.amount?.message}
        disabled={disabled}
        {...register("amount", {
          onChange: handleAmountChange,
        })}
      />

      <div
        className={cn(
          "flex items-center justify-between h-16 overflow-hidden gap-8",
          disabled && "opacity-50",
        )}
      >
        <Text className="flex items-center gap-0.5 break-all" color="secondary">
          {amount.toLocaleString()} credits
          <AiStarIcon pathClasses="bg-gradient-black-blue" />
        </Text>

        {isLoading ? (
          <Skeleton className="w-10 h-8" />
        ) : (
          <Text variant="h2" className="break-all">
            ${getPrice(Number(amount)).toLocaleString()}
          </Text>
        )}
      </div>
    </form>
  );
}
