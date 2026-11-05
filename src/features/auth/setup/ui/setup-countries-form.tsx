import { CountryFlag, useCountriesQuery } from "@/services/internalization";
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

const countriesFormSchema = z.object({
  countries: z.array(z.number()).nonempty("Countries are required"),
});

type CountriesFormValues = z.infer<typeof countriesFormSchema>;

export function SetupCountriesForm({
  onSubmit,
  isLoading,
  errorMessage,
}: {
  onSubmit: (data: CountriesFormValues) => void;
  isLoading?: boolean;
  errorMessage?: string;
}) {
  const { data: countriesData, isLoading: isLoadingCountries } =
    useCountriesQuery();

  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm<CountriesFormValues>({
    resolver: zodResolver(countriesFormSchema),
    defaultValues: {
      countries: [],
    },
  });

  return (
    <form className="flex flex-col gap-8" onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="countries"
        control={control}
        render={({ field }) => (
          <MultiSelect
            values={field.value.map(String)}
            onValuesChange={(values) => field.onChange(values.map(Number))}
            closeOnSelect
          >
            <MultiSelectTrigger error={errorMessage?.toString()}>
              <MultiSelectValue
                placeholder="Countries"
                isLoading={isLoadingCountries}
              />
            </MultiSelectTrigger>
            <MultiSelectContent search={{ placeholder: "Search countries..." }}>
              <MultiSelectGroup isLoading={isLoadingCountries}>
                {countriesData?.countries?.map((country) => (
                  <MultiSelectItem
                    key={country.id}
                    value={country.id.toString()}
                  >
                    <div className="flex items-center gap-2">
                      <CountryFlag countryCode={country.code} />
                      <span>{country.name}</span>
                    </div>
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
