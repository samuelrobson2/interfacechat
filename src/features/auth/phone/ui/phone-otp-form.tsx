import { Button } from "@/shared/ui/kit/button";
import {
  InputOTP,
  InputOTPFormWrapper,
  InputOTPGroup,
  InputOTPSlot,
} from "@/shared/ui/kit/otp-input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { usePhoneVerify } from "../model/use-phone-verify";
import { ResendOTP } from "./resend-otp";

const phoneOTPSchema = z.object({
  otp_code: z.string().min(6, {
    message: "Your one-time password must be 6 characters.",
  }),
});

type PhoneOTPFormValues = z.infer<typeof phoneOTPSchema>;

export function PhoneOTPForm({ phone }: { phone: string }) {
  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm<PhoneOTPFormValues>({
    resolver: zodResolver(phoneOTPSchema),
    defaultValues: {
      otp_code: "",
    },
  });
  const { phoneVerify, isPending, errorMessage } = usePhoneVerify();

  const submit = (data: PhoneOTPFormValues) => {
    phoneVerify({ phone, otp: data.otp_code });
  };

  return (
    <form className="flex flex-col gap-8" onSubmit={handleSubmit(submit)}>
      <Controller
        control={control}
        name="otp_code"
        render={({ field, fieldState: { error } }) => {
          const isError = !!error?.message || !!errorMessage;

          return (
            <InputOTPFormWrapper
              error={error?.message || errorMessage?.toString()}
            >
              <InputOTP
                containerClassName="justify-center"
                maxLength={6}
                {...field}
              >
                <InputOTPGroup>
                  <InputOTPSlot isError={isError} index={0} />
                  <InputOTPSlot isError={isError} index={1} />
                  <InputOTPSlot isError={isError} index={2} />
                  <InputOTPSlot isError={isError} index={3} />
                  <InputOTPSlot isError={isError} index={4} />
                  <InputOTPSlot isError={isError} index={5} />
                </InputOTPGroup>
              </InputOTP>
            </InputOTPFormWrapper>
          );
        }}
      />

      <ResendOTP phone={phone} duration={10} />

      <Button disabled={!isValid} type="submit" isLoading={isPending}>
        Continue
      </Button>
    </form>
  );
}
