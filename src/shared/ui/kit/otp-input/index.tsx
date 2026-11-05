import * as React from "react";
import { OTPInput, OTPInputContext } from "input-otp";
import { MinusIcon } from "lucide-react";

import { cn } from "@/shared/lib/css";
import { Text, textVariants } from "../text";

function InputOTPFormWrapper({
  error,
  children,
  ...props
}: React.ComponentProps<"div"> & { error?: string }) {
  return (
    <div className="flex flex-col gap-3" {...props}>
      {children}

      {error && <Text variant="label" color="error">{error}</Text>}
    </div>
  );
}

function InputOTP({
  className,
  containerClassName,
  ...props
}: React.ComponentProps<typeof OTPInput> & {
  containerClassName?: string;
}) {
  return (
    <OTPInput
      data-slot="input-otp"
      containerClassName={cn(
        "flex items-center gap-3 has-disabled:opacity-50",
        containerClassName,
      )}
      className={cn("disabled:cursor-not-allowed", className)}
      {...props}
    />
  );
}

function InputOTPGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-otp-group"
      className={cn("flex items-center gap-3", className)}
      {...props}
    />
  );
}

function InputOTPSlot({
  index,
  isError,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  isError?: boolean;
  index: number;
}) {
  const inputOTPContext = React.useContext(OTPInputContext);
  const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {};

  return (
    <div
      data-slot="input-otp-slot"
      data-active={isActive}
      className={cn(
        textVariants({ variant: "body" }),
        "relative flex h-15 w-15 items-center justify-center text-center",
        "bg-background-secondary rounded-[4px] px-4 py-2",
        "hairline [--hairline-radius:4px] shadow-inset-default",
        "transition-all duration-200 outline-none",
        "data-[active=true]:[--hairline-scale:1] data-[active=true]:[--hairline-color:var(--color-stroke-primary)] data-[active=true]:z-10",
        "disabled:cursor-not-allowed disabled:opacity-40",
        isError && "[--hairline-scale:1] [--hairline-color:var(--color-red-5)] data-[active=true]:[--hairline-color:var(--color-red-5)]",
        className,
      )}
      {...props}
    >
      {/* Show dot when empty and not active, otherwise show character */}
      {char || (!isActive && <Text color="secondary">•</Text>)}
      {/* Animated caret for active slot */}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="animate-caret-blink bg-stroke-secondary h-5 w-px duration-1000" />
        </div>
      )}
    </div>
  );
}

function InputOTPSeparator({ ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="input-otp-separator" role="separator" {...props}>
      <MinusIcon />
    </div>
  );
}

export {
  InputOTPFormWrapper,
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
};
