import { cn } from "@/shared/lib/css";
import * as FlagIcons from "country-flag-icons/react/3x2";
import { languageToCountryMap } from "../lib/language-to-country-map";

export const CountryFlag = ({
  countryCode,
  className,
  languageFlag = false,
}: {
  countryCode: string;
  className?: string;
  languageFlag?: boolean;
}) => {
  if (!countryCode) {
    return null;
  }

  // Get the correct country code for language flags
  const code = languageFlag
    ? languageToCountryMap[countryCode] ?? countryCode
    : countryCode;

  // Get the flag component dynamically using the country code
  const FlagComponent = FlagIcons[code.toUpperCase() as keyof typeof FlagIcons];

  if (!FlagComponent) return null;

  return (
    <FlagComponent
      className={cn("w-6 h-4", className)}
      title={`Flag of ${code.toUpperCase()}`}
    />
  );
};
