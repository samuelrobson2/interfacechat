import { CountryFlag, useCountriesQuery } from "@/services/internalization";
import amexImg from "@/shared/assets/images/payment-methods/american-express.png";
import discoverImg from "@/shared/assets/images/payment-methods/discover.png";
import maestroImg from "@/shared/assets/images/payment-methods/maestro.png";
import mastercardImg from "@/shared/assets/images/payment-methods/mastercard.png";
import visaImg from "@/shared/assets/images/payment-methods/visa.png";
import { useOptionsMap } from "@/shared/lib/react/use-options-map";
import { Button } from "@/shared/ui/kit/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/shared/ui/kit/combobox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/kit/dialog";
import { Input } from "@/shared/ui/kit/input";
import { Text } from "@/shared/ui/kit/text";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import z from "zod";
import { PaymentExpirationInput } from "./payment-expiration-input";
import { PaymentNumberInput } from "./payment-number-input";

const PAYMENT_METHOD_IMAGES = [
  { src: visaImg, alt: "Visa" },
  { src: mastercardImg, alt: "Mastercard" },
  { src: amexImg, alt: "American Express" },
  { src: discoverImg, alt: "Discover" },
  { src: maestroImg, alt: "Maestro" },
];

// Validation schema for payment card form
const addPaymentCardSchema = z.object({
  card_number: z
    .string()
    .nonempty("Card number is required")
    .regex(/^\d{4}\s\d{4}\s\d{4}\s\d{4}$/, "Invalid card number format"),
  expiration: z
    .string()
    .nonempty("Expiration date is required")
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Invalid expiration format (MM/YY)"),
  cvv: z
    .string()
    .nonempty("CVV is required")
    .regex(/^\d{3}$/, "CVV must be 3 digits"),
  zip_code: z.string().nonempty("Zip code is required"),
  country: z.string().nonempty("Country is required"),
});

export type AddPaymentCardFormValues = z.infer<typeof addPaymentCardSchema>;

export function AddPaymentDialog({
  trigger,
  ...props
}: React.ComponentProps<typeof Dialog> & {
  trigger?: React.ReactNode;
}) {
  const { data: countriesData } = useCountriesQuery();
  const contryTitles = countriesData?.countries.map((country) => country.name);
  const mapCountryTitles = useOptionsMap(countriesData?.countries, "name");

  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    clearErrors,
    formState: { errors },
  } = useForm<AddPaymentCardFormValues>({
    resolver: zodResolver(addPaymentCardSchema),
    defaultValues: {
      card_number: "",
      expiration: "",
      cvv: "",
      zip_code: "",
      country: "",
    },
  });

  const submit = (data: AddPaymentCardFormValues) => {
    // Detect card type based on first digit
    const firstDigit = data.card_number.charAt(0);
    let cardType = "Visa";
    if (firstDigit === "5") {
      cardType = "Master card";
    } else if (firstDigit === "3") {
      cardType = "American Express";
    } else if (firstDigit === "6") {
      cardType = "Discover";
    }

    console.log(data, cardType);

    // Reset form and close dialog
    reset();
    clearErrors();
    setOpen(false);
    props.onOpenChange?.(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen} {...props}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}

      <DialogContent>
        <form className="flex flex-col gap-8" onSubmit={handleSubmit(submit)}>
          <DialogHeader>
            <DialogTitle>Add Payment Method</DialogTitle>
          </DialogHeader>

          <div className="flex gap-4 items-center justify-center">
            {PAYMENT_METHOD_IMAGES.map((image) => (
              <img key={image.alt} src={image.src} alt={image.alt} />
            ))}
          </div>

          <div className="grid grid-cols-2 gap-5.5">
            <Controller
              name="card_number"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <PaymentNumberInput
                  label="Card number"
                  wrapperClassName="col-span-2"
                  value={field.value}
                  onChange={field.onChange}
                  error={error?.message}
                />
              )}
            />

            <Controller
              name="expiration"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <PaymentExpirationInput
                  label="Expiration"
                  value={field.value}
                  onChange={field.onChange}
                  error={error?.message}
                />
              )}
            />

            <Input
              label="CVV"
              placeholder="123"
              maxLength={3}
              type="password"
              {...register("cvv")}
              error={errors.cvv?.message}
            />

            <Input
              label="Zip code"
              wrapperClassName="col-span-2"
              {...register("zip_code")}
              error={errors.zip_code?.message}
            />

            <Controller
              control={control}
              name="country"
              render={({ field, fieldState: { error } }) => (
                <Combobox
                  items={contryTitles}
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <ComboboxInput
                    wrapperClassName="col-span-2"
                    label="Country"
                    error={error?.message}
                  />
                  <ComboboxContent onWheel={(e) => e.stopPropagation()}>
                    <ComboboxEmpty>No items found.</ComboboxEmpty>
                    <ComboboxList>
                      {(item: string) => (
                        <ComboboxItem key={item} value={item}>
                          <div className="flex items-center gap-2">
                            <CountryFlag
                              countryCode={mapCountryTitles[item]?.code || ""}
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
          </div>

          <DialogFooter className="flex gap-3">
            <Button className="flex-1" type="submit">
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
