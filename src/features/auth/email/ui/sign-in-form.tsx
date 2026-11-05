import { Button } from "@/shared/ui/kit/button";
import { Input } from "@/shared/ui/kit/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { PasswordInput } from "@/services/auth";
import { Link } from "react-router-dom";
import { ROUTES } from "@/shared/model/routes";
import { useSignin } from "../model/use-signin";

const signInSchema = z.object({
  email: z
    .string()
    .nonempty("Email is required")
    .pipe(z.email("Invalid email")),
  password: z.string().nonempty("Password is required"),
});

type SignInFormValues = z.infer<typeof signInSchema>;

export function SignInForm({
  onLoginSuccess,
}: {
  onLoginSuccess?: () => void | Promise<void>;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const { signIn, isPending, errorMessage } = useSignin({
    onSuccess: onLoginSuccess,
  });

  return (
    <form className="flex flex-col gap-8" onSubmit={handleSubmit(signIn)}>
      <div className="flex flex-col gap-6">
        <Input
          label="Email"
          error={errors.email?.message}
          isError={!!errorMessage}
          {...register("email")}
        />

        <div className="flex flex-col gap-2">
          <PasswordInput
            label="Password"
            error={errors.password?.message || errorMessage?.toString()}
            {...register("password")}
          />

          <Button type="button" className="self-end" variant="link" asChild>
            <Link to={ROUTES.RESET_PASSWORD}>Forgot password?</Link>
          </Button>
        </div>
      </div>

      <Button isLoading={isPending} type="submit">
        Continue
      </Button>
    </form>
  );
}
