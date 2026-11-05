import { useLanguagesQuery } from "@/services/internalization";
import { Button } from "@/shared/ui/kit/button";
import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectGroup,
  MultiSelectItem,
  MultiSelectTrigger,
  MultiSelectValue,
} from "@/shared/ui/kit/multi-select";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

const languagesFormSchema = z.object({
  languages: z.array(z.number()).nonempty("Languages are required"),
});

type LanguagesFormValues = z.infer<typeof languagesFormSchema>;

export function SetupLanguagesForm({
  onSubmit,
  isLoading,
  errorMessage,
}: {
  onSubmit: (data: LanguagesFormValues) => void;
  isLoading?: boolean;
  errorMessage?: string;
}) {
  const { data: languagesData, isLoading: isLoadingLanguages } =
    useLanguagesQuery();

  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm<LanguagesFormValues>({
    resolver: zodResolver(languagesFormSchema),
    defaultValues: {
      languages: [],
    },
  });

  return (
    <form className="flex flex-col gap-8" onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="languages"
        control={control}
        render={({ field }) => (
          <MultiSelect
            values={field.value.map(String)}
            onValuesChange={(values) => field.onChange(values.map(Number))}
            closeOnSelect
          >
            <MultiSelectTrigger error={errorMessage?.toString()}>
              <MultiSelectValue
                placeholder="Languages"
                isLoading={isLoadingLanguages}
              />
            </MultiSelectTrigger>
            <MultiSelectContent search={{ placeholder: "Search languages..." }}>
              <MultiSelectGroup isLoading={isLoadingLanguages}>
                {languagesData?.languages?.map((language) => (
                  <MultiSelectItem
                    key={language.id}
                    value={language.id.toString()}
                  >
                    {language.name}
                  </MultiSelectItem>
                ))}
              </MultiSelectGroup>
            </MultiSelectContent>
          </MultiSelect>
        )}
      />

      <Button type="submit" disabled={!isValid} isLoading={isLoading}>
        Continue
      </Button>
    </form>
  );
}
