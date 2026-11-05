import {
  PASSWORD_REQUIREMENTS,
  PasswordInput,
  passwordSchema as passwordSchemaLib,
  PasswordStrengthChecker,
  usePasswordStrengthCheck,
} from "@/services/auth";
import { Button } from "@/shared/ui/kit/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Text } from "@/shared/ui/kit/text";
import { PRIVACY_LINK, TERMS_LINK } from "@/shared/model/routes";

const passwordSchema = z
  .object({
    password: passwordSchemaLib,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

export function PasswordForm({
  isPending = false,
  errorMessage,
  onSubmit,
  submitLabel = "Create account",
  showTermsAgreement = true,
}: {
  isPending?: boolean;
  errorMessage?: string | React.ReactNode;
  onSubmit: (data: PasswordFormValues) => void;
  submitLabel?: string;
  showTermsAgreement?: boolean;
}) {
  const { failedRequirements, handlePasswordInput } =
    usePasswordStrengthCheck();
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    mode: "onBlur",
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  return (
    <form className="flex flex-col gap-8" onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col gap-6">
        <PasswordInput
          label="Password"
          onInput={handlePasswordInput}
          isError={!!errorMessage}
          {...register("password")}
        />

        <PasswordInput
          label="Confirm password"
          error={errors.confirmPassword?.message || errorMessage}
          {...register("confirmPassword")}
        />
      </div>

      <PasswordStrengthChecker
        passwordRequirements={PASSWORD_REQUIREMENTS}
        failedRequirements={failedRequirements}
      />
      {showTermsAgreement && (
        <Text className="text-center text-muted-foreground text-sm">
          By registering, I agree to the{" "}
          <a
            href={TERMS_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground"
          >
            Terms of Service
          </a>
          <br />
          and{" "}
          <a
            href={PRIVACY_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground"
          >
            Privacy Policy
          </a>
          .
        </Text>
      )}
      <Button isLoading={isPending} disabled={!isValid} type="submit">
        {submitLabel}
      </Button>
    </form>
  );
}
