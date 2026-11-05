import type { ApiSchemas } from "@/shared/api/schema";
import {
  SettingsItem,
  SettingsItemContent,
  SettingsItemHeader,
} from "../../_ui/settings-item";
import { PaymentCard } from "../ui/payment-card";
import {
  useSubscriptionData,
  useSetPaymentMethod,
  useDeletePaymentMethod,
} from "@/services/payment";
import { cn } from "@/shared/lib/css";

function isCardExpired(exp_month: number, exp_year: number): boolean {
  const expirationDate = new Date(exp_year, exp_month - 1);
  return expirationDate < new Date();
}

export function PaymentMethods({
  subscriptions,
  activeGrantedPlan,
  paymentMethods,
  paymentMethodDefault,
}: {
  subscriptions: ApiSchemas["SubscriptionListResponseDto"];
  activeGrantedPlan: ApiSchemas["ActiveGrantedPlanResponseDto"];
  paymentMethods: ApiSchemas["PaymentMethodsListResponseDto"];
  paymentMethodDefault?: ApiSchemas["PaymentMethodDefaultDto"];
}) {
  const { defaultPaymentMethodId, subscriptionId } = useSubscriptionData(
    subscriptions,
    activeGrantedPlan,
  );
  const { setPaymentMethod, isPending: isPendingSetPayment } =
    useSetPaymentMethod();
  const { deletePaymentMethod, isPending: isPendingDelete } =
    useDeletePaymentMethod();

  const hasPaymentMethods = paymentMethods.length > 0;

  const currentPaymentId = defaultPaymentMethodId || paymentMethodDefault?.id;

  return (
    <SettingsItem className="col-span-2">
      <SettingsItemContent>
        <SettingsItemHeader
          title="Payment method"
          description={
            hasPaymentMethods
              ? "Choose your payment method"
              : "There is no payment method for this account"
          }
        />

        {hasPaymentMethods && (
          <div
            className={cn(
              "grid grid-cols-2 gap-4 w-full",
              (isPendingSetPayment || isPendingDelete) &&
                "opacity-50 pointer-events-none",
            )}
          >
            {paymentMethods.map((payment) => {
              const isSelected = currentPaymentId === payment.id;

              return (
                <PaymentCard
                  key={payment.id}
                  brand={payment.card?.brand || ""}
                  display_brand={payment.card?.display_brand || ""}
                  last4={payment.card?.last4 || ""}
                  isExpired={isCardExpired(
                    payment.card?.exp_month || 0,
                    payment.card?.exp_year || 0,
                  )}
                  isSelected={isSelected}
                  onSelect={() =>
                    !isSelected &&
                    setPaymentMethod(payment.id, subscriptionId ?? "")
                  }
                  onDelete={() => deletePaymentMethod(payment.id)}
                />
              );
            })}
          </div>
        )}
      </SettingsItemContent>
    </SettingsItem>
  );
}
