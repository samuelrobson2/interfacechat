import { cn } from "@/shared/lib/css";
import { Button } from "@/shared/ui/kit/button";
import { useChangePlanDialog } from "../model/use-change-plan-dialog";
import { usePlanDataSuspense } from "../model/use-plan-data-suspense";
import { DowngradePlanDialog } from "../ui/downgrade-plan-dialog";
import { PlanItem } from "../ui/plan-item";
import { UpgradePlanDialog } from "../ui/upgrade-plan-dialog";
import { PLAN_IMAGES, type PaymentPlanType } from "../lib/plans-images";
import { Link } from "react-router-dom";
import { CONTACT_SALES_LINK } from "@/shared/model/routes";

export function PlansList() {
  const { plans } = usePlanDataSuspense();

  const {
    selectedPlanId,
    upgradePlan,
    downgradePlan,
    isPending,
    handlePlanClick,
    handleConfirmUpgrade,
    handleConfirmDowngrade,
    handleCloseUpgrade,
    handleCloseDowngrade,
  } = useChangePlanDialog({
    plans,
  });

  return (
    <>
      <div className="grid grid-cols-4 gap-8 auto-rows-min overflow-y-auto pb-10 no-scrollbar">
        {plans.map((plan) => {
          const { isCurrentPlan, actionText, hideButton, ...rest } = plan;
          const isLoading = isPending && selectedPlanId === plan.id;
          const planImage = PLAN_IMAGES[plan.title as PaymentPlanType];

          return (
            <PlanItem
              key={plan.id}
              {...rest}
              planImage={
                <img
                  className="w-22.5 h-22.5 self-center"
                  src={planImage.image}
                  alt={planImage.alt}
                />
              }
              action={
                plan.planAction === "contact" ? (
                  <Button asChild>
                    <Link to={CONTACT_SALES_LINK} target="_blank">
                      Contact us
                    </Link>
                  </Button>
                ) : (
                  <Button
                    className={cn(
                      "h-auto whitespace-normal text-wrap",
                      hideButton && "opacity-0 pointer-events-none",
                      isLoading && "h-14",
                    )}
                    disabled={isCurrentPlan}
                    variant={isCurrentPlan ? "secondary" : "primary"}
                    isLoading={isLoading}
                    onClick={() => handlePlanClick(plan.id)}
                  >
                    {actionText}
                  </Button>
                )
              }
            />
          );
        })}
      </div>

      {upgradePlan && (
        <UpgradePlanDialog
          isOpen
          isPending={isPending}
          planName={upgradePlan.planName}
          upgradeAmount={upgradePlan.upgradeAmount}
          onClose={handleCloseUpgrade}
          onConfirm={handleConfirmUpgrade}
        />
      )}

      {downgradePlan && (
        <DowngradePlanDialog
          isOpen
          isPending={isPending}
          planName={downgradePlan.planName}
          activeUntilDate={downgradePlan.activeUntilDate}
          nextChargeAmount={downgradePlan.nextChargeAmount}
          onClose={handleCloseDowngrade}
          onConfirm={handleConfirmDowngrade}
        />
      )}
    </>
  );
}
