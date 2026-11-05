import { useQuery } from "@tanstack/react-query";
import { paymentQueryOptions } from "./payment-query-options";

export function useCreditsPackages() {
  const { data: packages, isLoading } = useQuery(paymentQueryOptions.billingPackages());

  const currentPackage = packages?.[0];
  const priceDollars = currentPackage?.price_cents ? currentPackage.price_cents / 100 : 1;

  const getPrice = (credits: number) => {
    return credits * priceDollars;
  };

  return {
    packages,
    isLoading,
    getPrice,
  };
}