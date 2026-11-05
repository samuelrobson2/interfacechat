import { Button } from "@/shared/ui/kit/button";
import { Input } from "@/shared/ui/kit/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useCheckEmail } from "../model/use-check-email";

const signUpSchema = z.object({
  email: z
    .string()
    .nonempty("Email is required")
    .pipe(z.email("Invalid email")),
});

export type SignUpFormValues = z.infer<typeof signUpSchema>;

export function SignUpForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
    },
  });
  const { checkEmail, isPending, errorMessage } = useCheckEmail();

  return (
    <form className="flex flex-col gap-8" onSubmit={handleSubmit(checkEmail)}>
      <Input
        label="Email"
        error={errors.email?.message || errorMessage?.toString()}
        {...register("email")}
      />

      <Button variant="primary" size="56" isLoading={isPending}>
        Continue
      </Button>
    </form>
  );
}
