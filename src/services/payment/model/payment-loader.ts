import { toast } from "@/shared/ui/kit/sonner-toast";
import { useEffect } from "react";
import { redirect, useLoaderData } from "react-router-dom";

const CHECKOUT_MESSAGE_KEY = "checkout_message";

export type PaymentLoaderData = {
  message: string;
  isSuccess: boolean;
} | null;

type PaymentType = "plan" | "top-up";

const paymentMessages: Record<PaymentType, { success: string; error: string }> =
  {
    plan: {
      success: "Subscription was successfully activated!",
      error: "Some error happened while activating subscription",
    },
    "top-up": {
      success: "Credits was successfully added to your account!",
      error: "Some error happened while adding credits to your account",
    },
  } as const;

export function paymentLoader(type: PaymentType) {
  const { success, error } = paymentMessages[type];

  return async ({
    request,
  }: {
    request: Request;
  }): Promise<PaymentLoaderData> => {
    const url = new URL(request.url);
    const checkoutSuccess = url.searchParams.get("checkout_success");

    // Check for flash message from previous redirect
    const storedMessage = JSON.parse(
      sessionStorage.getItem(CHECKOUT_MESSAGE_KEY) ?? "null",
    );

    if (storedMessage) {
      sessionStorage.removeItem(CHECKOUT_MESSAGE_KEY);
      return storedMessage;
    }

    if (!checkoutSuccess) return null;

    if (checkoutSuccess === "true") {
      sessionStorage.setItem(
        CHECKOUT_MESSAGE_KEY,
        JSON.stringify({
          message: success,
          isSuccess: true,
        }),
      );
    } else if (checkoutSuccess === "false") {
      sessionStorage.setItem(
        CHECKOUT_MESSAGE_KEY,
        JSON.stringify({
          message: error,
          isSuccess: false,
        }),
      );
    }

    url.searchParams.delete("checkout_success");
    const queryString = url.searchParams.toString();

    const cleanUrl =
      url.pathname.replace("/app", "") + (queryString ? `?${queryString}` : "");
    throw redirect(cleanUrl);
  };
}

export function usePaymentLoader() {
  const loaderData = useLoaderData<PaymentLoaderData>();

  useEffect(() => {
    if (!loaderData) return;
    const { message, isSuccess } = loaderData;

    const timeout = setTimeout(() => {
      if (isSuccess) {
        toast.success(message);
      } else {
        toast.error(message);
      }
    }, 100);

    return () => clearTimeout(timeout);
  }, [loaderData]);
}
