import {
  PASSWORD_REQUIREMENTS,
  PasswordInput,
  passwordSchema,
  PasswordStrengthChecker,
  usePasswordStrengthCheck,
} from "@/services/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const passwordFormSchema = z.object({
  newPassword: passwordSchema,
});

type PasswordFormValues = z.infer<typeof passwordFormSchema>;

export const NewPasswordForm = ({
  onSubmit,
  errorMessage,
  ...props
}: Omit<React.ComponentProps<"form">, "onSubmit"> & {
  onSubmit?: (values: PasswordFormValues) => void;
  errorMessage?: string;
}) => {
  const { failedRequirements, handlePasswordInput } =
    usePasswordStrengthCheck();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      newPassword: "",
    },
  });

  const handleFormSubmit = (values: PasswordFormValues) => {
    onSubmit?.(values);
  };

  return (
    <form
      className="flex flex-col gap-8"
      {...props}
      onSubmit={handleSubmit(handleFormSubmit)}
    >
      <PasswordInput
        className="flex-1"
        label="New password"
        onInput={handlePasswordInput}
        error={errors.newPassword?.message || errorMessage}
        {...register("newPassword")}
      />

      <PasswordStrengthChecker
        className="bg-background-primary"
        passwordRequirements={PASSWORD_REQUIREMENTS}
        failedRequirements={failedRequirements}
      />
    </form>
  );
};
