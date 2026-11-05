import type { ImportSourceProvider } from "@/services/settings";
import { cn } from "@/shared/lib/css";
import { Card } from "@/shared/ui/kit/card";
import { Input } from "@/shared/ui/kit/input";
import { Text } from "@/shared/ui/kit/text";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const urlSchema = z
  .string()
  .nonempty("URL is required")
  .pipe(z.url("Invalid URL"));
const nameSchema = z.string().nonempty("Name or URL is required");

const getSchema = (provider: ImportSourceProvider) => {
  return z.object({
    url: provider === "huggingface" ? nameSchema : urlSchema,
  });
};

export function LinkImportCard({
  importSource,
  isSelected,
  icon,
  title,
  description,
  action,
  formId,
  errorMessage,
  onSubmit,
  ...props
}: Omit<React.ComponentProps<"label">, "onSubmit"> & {
  importSource: ImportSourceProvider;
  isSelected: boolean;
  icon: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  formId: string;
  errorMessage?: string | string[];
  onSubmit: (data: z.infer<ReturnType<typeof getSchema>>) => void;
}) {
  const {
    handleSubmit,
    formState: { errors },
    register,
  } = useForm<z.infer<ReturnType<typeof getSchema>>>({
    resolver: zodResolver(getSchema(importSource)),
    defaultValues: {
      url: "",
    },
  });

  return (
    <Card
      className={cn(
        "flex p-6 flex-row gap-4 cursor-pointer transition-colors",
        "hover:bg-neutral-100",
        isSelected && "bg-neutral-100",
      )}
      asChild
    >
      <label {...props}>
        <div className="bg-background-primary rounded-[24px] size-20 flex items-center justify-center shrink-0">
          {icon}
        </div>

        <div className="flex-1 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-2">
              <Text variant="title">{title}</Text>
              <Text color="secondary">{description}</Text>
            </div>

            {action}
          </div>

          <form
            id={formId}
            onSubmit={handleSubmit(onSubmit)}
            className={isSelected ? "block" : "hidden"}
          >
            <Input
              label={importSource === "huggingface" ? "Name or URL" : "URL"}
              {...register("url")}
              error={errors.url?.message || errorMessage?.toString()}
            />
          </form>
        </div>
      </label>
    </Card>
  );
}
