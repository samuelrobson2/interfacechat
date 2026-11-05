import usaFlag from "@/shared/assets/images/country-flags/usa.png";
import englandFlag from "@/shared/assets/images/country-flags/england.png";
import russiaFlag from "@/shared/assets/images/country-flags/russia.png";
import ukrainFlag from "@/shared/assets/images/country-flags/ukrain.png";
import polandFlag from "@/shared/assets/images/country-flags/poland.png";
import swedenFlag from "@/shared/assets/images/country-flags/sweden.png";
import turkeyFlag from "@/shared/assets/images/country-flags/turkey.png";
import chinaFlag from "@/shared/assets/images/country-flags/china.png";
import indiaFlag from "@/shared/assets/images/country-flags/india.png";
import japanFlag from "@/shared/assets/images/country-flags/japan.png";

export interface CountryOption {
  title: string;
  value: string;
  flag: string;
}

// TODO: Replace with actual data from backend
export const COUNTRY_PHONE_OPTIONS: CountryOption[] = [
  {
    title: "United States (+1)",
    value: "+1",
    flag: usaFlag,
  },
  {
    title: "United Kingdom (+44)",
    value: "+44",
    flag: englandFlag,
  },
  {
    title: "Russia (+7)",
    value: "+7",
    flag: russiaFlag,
  },
  {
    title: "Ukraine (+380)",
    value: "+380",
    flag: ukrainFlag,
  },
  {
    title: "Poland (+48)",
    value: "+48",
    flag: polandFlag,
  },
  {
    title: "Sweden (+46)",
    value: "+46",
    flag: swedenFlag,
  },
  {
    title: "Turkey (+90)",
    value: "+90",
    flag: turkeyFlag,
  },
  {
    title: "China (+86)",
    value: "+86",
    flag: chinaFlag,
  },
  {
    title: "India (+91)",
    value: "+91",
    flag: indiaFlag,
  },
  {
    title: "Japan (+81)",
    value: "+81",
    flag: japanFlag,
  },
];

export const COUNTRY_PHONE_OPTIONS_TITLES = COUNTRY_PHONE_OPTIONS.map(
  (option) => option.title,
);

// TODO: Replace with actual data from backend
export const COUNTRY_OPTIONS: CountryOption[] = [
  {
    title: "United States",
    value: "US",
    flag: usaFlag,
  },
  {
    title: "United Kingdom",
    value: "UK",
    flag: englandFlag,
  },
  {
    title: "Russia",
    value: "RU",
    flag: russiaFlag,
  },
  {
    title: "Ukraine",
    value: "UA",
    flag: ukrainFlag,
  },
  {
    title: "Poland",
    value: "PL",
    flag: polandFlag,
  },
  {
    title: "Sweden",
    value: "SE",
    flag: swedenFlag,
  },
  {
    title: "Turkey",
    value: "TR",
    flag: turkeyFlag,
  },
  {
    title: "China",
    value: "CN",
    flag: chinaFlag,
  },
  {
    title: "India",
    value: "IN",
    flag: indiaFlag,
  },
  {
    title: "Japan",
    value: "JP",
    flag: japanFlag,
  },
];
