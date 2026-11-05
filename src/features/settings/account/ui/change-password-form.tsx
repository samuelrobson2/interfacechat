import { PasswordInput } from "@/services/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import type React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const passwordFormSchema = z.object({
  currentPassword: z.string().nonempty("Current password is required"),
});

type PasswordFormValues = z.infer<typeof passwordFormSchema>;

export const ChangePasswordForm = ({
  onSubmit,
  errorMessage,
  ...props
}: Omit<React.ComponentProps<"form">, "onSubmit"> & {
  onSubmit?: (values: PasswordFormValues) => void;
  errorMessage?: string;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
    },
  });

  const handleFormSubmit = (values: PasswordFormValues) => {
    onSubmit?.(values);
  };

  return (
    <form
      className="flex flex-col gap-6"
      {...props}
      onSubmit={handleSubmit(handleFormSubmit)}
    >
      <PasswordInput
        className="flex-1"
        label="Current password"
        error={errors.currentPassword?.message || errorMessage}
        {...register("currentPassword")}
      />
    </form>
  );
};
