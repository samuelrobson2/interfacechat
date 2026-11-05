import {
  COUNTRY_PHONE_OPTIONS,
  COUNTRY_PHONE_OPTIONS_TITLES,
} from "@/shared/model/countries";
import { Button } from "@/shared/ui/kit/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/shared/ui/kit/combobox";
import { Text } from "@/shared/ui/kit/text";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { usePhoneLogin } from "../model/use-phone-login";
import { PhoneInput } from "./phone-input";
import { useOptionsMap } from "@/shared/lib/react/use-options-map";

const phoneAuthSchema = z.object({
  country_code: z.string().nonempty("Country is required"),
  phone: z.string().nonempty("Phone is required"),
});

export type PhoneAuthFormValues = z.infer<typeof phoneAuthSchema>;

export function PhoneAuthForm() {
  const [countryCode, setCountryCode] = useState<string>(
    COUNTRY_PHONE_OPTIONS[0]?.value || "",
  );
  const { control, handleSubmit } = useForm<PhoneAuthFormValues>({
    resolver: zodResolver(phoneAuthSchema),
    defaultValues: {
      country_code: COUNTRY_PHONE_OPTIONS[0]?.title,
      phone: "",
    },
  });
  const { phoneLogin, isPending, errorMessage } = usePhoneLogin();
  const countryCodeOptionsMap = useOptionsMap(COUNTRY_PHONE_OPTIONS, "title");

  const submit = (data: PhoneAuthFormValues) => {
    phoneLogin({ phone: countryCode + data.phone });
  };

  return (
    <form className="flex flex-col gap-8" onSubmit={handleSubmit(submit)}>
      <div className="flex flex-col gap-6">
        <Controller
          control={control}
          name="country_code"
          render={({ field, fieldState: { error } }) => (
            <Combobox
              items={COUNTRY_PHONE_OPTIONS_TITLES}
              value={field.value}
              onValueChange={(details) => {
                if (!details) return;

                field.onChange(details);
                setCountryCode(countryCodeOptionsMap[details]?.value || "");
              }}
            >
              <ComboboxInput label="Country code" error={error?.message} />
              <ComboboxContent>
                <ComboboxEmpty>No items found.</ComboboxEmpty>
                <ComboboxList>
                  {(item: string) => (
                    <ComboboxItem key={item} value={item}>
                      <div className="flex items-center gap-2">
                        <img
                          src={countryCodeOptionsMap[item]?.flag}
                          alt={item}
                        />
                        <Text>{item}</Text>
                      </div>
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          )}
        />

        <Controller
          control={control}
          name="phone"
          render={({ field, fieldState: { error } }) => (
            <PhoneInput
              label="Phone number"
              countryCode={countryCode}
              error={error?.message || errorMessage?.toString()}
              {...field}
            />
          )}
        />
      </div>

      <Button type="submit" isLoading={isPending}>
        Continue
      </Button>
    </form>
  );
}
