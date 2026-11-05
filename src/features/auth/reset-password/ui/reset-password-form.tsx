import { Button } from "@/shared/ui/kit/button";
import { Input } from "@/shared/ui/kit/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useResetPassword } from "../model/use-reset-password";

const resetPasswordSchema = z.object({
  email: z
    .string()
    .nonempty("Email is required")
    .pipe(z.email("Invalid email")),
});

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: "",
    },
  });
  const { resetPassword, isPending, errorMessage } = useResetPassword();

  return (
    <form
      className="flex flex-col gap-8"
      onSubmit={handleSubmit(resetPassword)}
    >
      <div className="flex flex-col gap-6">
        <Input
          label="Email"
          error={errors.email?.message || errorMessage?.toString()}
          {...register("email")}
        />
      </div>

      <Button isLoading={isPending} type="submit">
        Continue
      </Button>
    </form>
  );
}
