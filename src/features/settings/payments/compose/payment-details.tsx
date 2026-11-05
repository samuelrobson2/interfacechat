import { Separator } from "@/shared/ui/kit/separator";
import { PaymentCredits } from "./payment-credits";
import { PaymentMethods } from "./payment-methods";
import { PaymentPlan } from "./payment-plan";
import { useSuspenseQueries } from "@tanstack/react-query";
import { paymentQueryOptions, usePaymentLoader } from "@/services/payment";
import { useSessionStore } from "@/services/auth";

export function PaymentDetails() {
  usePaymentLoader();

  const user = useSessionStore((state) => state.user);
  const [
    { data: credits },
    { data: subscriptions },
    { data: activeGrantedPlan },
    { data: paymentMethods },
    { data: paymentMethodDefault },
    { data: plans },
  ] = useSuspenseQueries({
    queries: [
      paymentQueryOptions.organizationCredits(
        user?.organizations[0]?.organization_id ?? "",
      ),
      paymentQueryOptions.subscription(),
      paymentQueryOptions.activeGrantedPlan(),
      paymentQueryOptions.paymentMethods(),
      paymentQueryOptions.paymentMethodsDefault(),
      paymentQueryOptions.billingPlans(),
    ],
  });

  return (
    <div className="flex flex-col h-full gap-12">
      <div className="flex h-fit gap-8">
        <PaymentPlan
          subscriptions={subscriptions}
          activeGrantedPlan={activeGrantedPlan}
          plans={plans}
          className="flex-1"
        />

        <Separator orientation="vertical" />

        <PaymentCredits credits={credits} className="flex-1" />
      </div>

      <Separator />

      <PaymentMethods
        subscriptions={subscriptions}
        activeGrantedPlan={activeGrantedPlan}
        paymentMethods={paymentMethods}
        paymentMethodDefault={paymentMethodDefault}
      />
    </div>
  );
}
