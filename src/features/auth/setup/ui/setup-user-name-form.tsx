import { Button } from "@/shared/ui/kit/button";
import { Input } from "@/shared/ui/kit/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const userNameFormSchema = z.object({
  name: z.string().nonempty("Name is required"),
});

export type UserNameFormValues = z.infer<typeof userNameFormSchema>;

export function SetupUserNameForm({
  onSubmit,
  isLoading,
  errorMessage,
}: {
  onSubmit: (data: UserNameFormValues) => void;
  isLoading?: boolean;
  errorMessage?: string;
}) {
  const {
    register,
    handleSubmit,
    formState: { isValid },
  } = useForm<UserNameFormValues>({
    resolver: zodResolver(userNameFormSchema),
    defaultValues: {
      name: "",
    },
  });

  return (
    <form className="flex flex-col gap-8" onSubmit={handleSubmit(onSubmit)}>
      <Input
        label="Your name"
        error={errorMessage?.toString()}
        {...register("name")}
      />

      <Button type="submit" disabled={!isValid} isLoading={isLoading}>
        Continue
      </Button>
    </form>
  );
}
