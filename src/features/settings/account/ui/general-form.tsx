import { PHONE_REGEX } from "@/services/auth";
import { Button } from "@/shared/ui/kit/button";
import { Input } from "@/shared/ui/kit/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const generalFormSchema = z.object({
  email: z
    .string()
    .nonempty("Email is required")
    .pipe(z.email("Invalid email")),
  phoneNumber: z
    .string()
    .nonempty("Phone number is required")
    .regex(PHONE_REGEX, "Invalid phone number format"),
});

type GeneralFormValues = z.infer<typeof generalFormSchema>;

export const GeneralForm = ({
  defaultValues,
  onSubmit,
}: {
  defaultValues?: Partial<GeneralFormValues>;
  onSubmit?: (values: GeneralFormValues) => void;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GeneralFormValues>({
    resolver: zodResolver(generalFormSchema),
    defaultValues: {
      email: defaultValues?.email || "",
      phoneNumber: defaultValues?.phoneNumber || "",
    },
  });

  const handleFormSubmit = (values: GeneralFormValues) => {
    onSubmit?.(values);
  };

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={handleSubmit(handleFormSubmit)}
    >
      <div className="flex gap-8 items-baseline">
        <Input
          className="flex-1"
          label="Email"
          error={errors.email?.message}
          {...register("email")}
        />
        <Input
          className="flex-1"
          label="Phone number"
          error={errors.phoneNumber?.message}
          {...register("phoneNumber")}
        />
      </div>

      <Button className="self-start min-w-[172px]" type="submit">Save</Button>
    </form>
  );
};
