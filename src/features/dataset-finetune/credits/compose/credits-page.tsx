import { useSessionStore } from "@/services/auth";
import { useMemo, useState } from "react";
import { Text } from "@/shared/ui/kit/text";
import { Card } from "@/shared/ui/kit/card";
import { AiStarIcon } from "@/shared/assets/icons/outlined/AiStar";
import { ArrowLeftIcon } from "@/shared/assets/icons/outlined/ArrowLeft";
import { ArrowRightIcon } from "@/shared/assets/icons/outlined/ArrowRight";
import { Button } from "@/shared/ui/kit/button";
import {
  FinetuneStepsContent,
  FinetuneStepsContentWrapper,
} from "../../_ui/finetune-steps-layout";
import { useFinetuneCreditsState } from "../model/use-finetune-credits-state";
import { href, Link, useLocation } from "react-router-dom";
import { ROUTES } from "@/shared/model/routes";
import { PaymentTopUpDialog, PaymentTopUpForm } from "@/services/payment";
import coneImage from "@/shared/assets/images/diagnosis/diagnosis-add-data-yes.png";
import inclinedCirclesImage from "@/shared/assets/images/diagnosis/diagnosis-diverse-yes.png";
import autoScientistImage from "@/shared/assets/images/autoscientist.png";
import { Separator } from "@/shared/ui/kit/separator";
import { RadioGroup, RadioGroupItem } from "@/shared/ui/kit/radio-group";
import { Input } from "@/shared/ui/kit/input";
import { CheckIcon } from "@/shared/assets/icons/outlined/Check";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/kit/dialog";
import FireIcon from "@/shared/assets/images/fire.png";
import { useFinetuneStepQuery } from "@/services/dataset";
import { FINETUNE_STEP_KEYS } from "../../_lib/finetune-routes";
import type { ApiSchemas } from "@/shared/api/schema";
import { useConfirmLaunch } from "../../confirm/model/use-confirm-launch";

function CostItem({
  title,
  subtitle,
  value,
  icon,
}: {
  title: string;
  subtitle?: string;
  value: number;
  icon: string;
}) {
  return (
    <div className="relative flex items-center gap-4 pr-6 border border-gray-2 rounded-[6px] p-[12px]">
      <img
        src={icon}
        alt={title}
        className="h-[84px] w-[84px] object-contain"
      />
      <div className="flex flex-col gap-1">
        <Text color="secondary">{title}</Text>
        {subtitle && (
          <Text
            color="secondary"
            className="flex items-center gap-0.5 line-through"
          >
            {subtitle} <AiStarIcon pathClasses="secondary" />
          </Text>
        )}
        <Text className="flex items-center gap-0.5" variant="title">
          {value.toLocaleString()} Credits{" "}
          <AiStarIcon pathClasses="bg-gradient-black-blue" />
        </Text>
      </div>
    </div>
  );
}

function InfoItem({ title, value }: { title: string; value: string }) {
  return (
    <div className="flex flex-row items-center justify-between gap-[16px]">
      <Text variant="subtitle">{title}</Text>
      <Text className="flex items-center gap-0.5" color="secondary">
        {value} <AiStarIcon pathClasses="bg-gradient-black-blue" />
      </Text>
    </div>
  );
}

export function CreditsPage() {
  const [pendingRemoval, setPendingRemoval] = useState<
    "domain" | "general" | null
  >(null);
  const { search } = useLocation();
  const user = useSessionStore((state) => state.user);
  const userName = user?.profile?.name ?? "";
  const {
    datasetId,
    domainExpansionCost,
    diversityExpansionCost,
    autoScientistTrainingCost,
    totalOrderCost,
    totalCredits,
    isNotEnoughCredits,
    shouldShowDomainSlider,
    shouldShowGeneralSlider,
    remainingRequestedCredits,
    removeDomainExpansion,
    removeGeneralExpansion,
  } = useFinetuneCreditsState();
  const { submit: launchFinetune, isLaunching } = useConfirmLaunch();
  const { data: confirmStepData } = useFinetuneStepQuery(
    datasetId,
    FINETUNE_STEP_KEYS.confirm,
  );
  const launchPayload = useMemo(() => {
    const inlineData = confirmStepData?.step.inline_data as
      | { launch_payload?: ApiSchemas["LaunchFinetuneJobDto"] }
      | null
      | undefined;
    return inlineData?.launch_payload;
  }, [confirmStepData?.step.inline_data]);

  if (!datasetId) {
    return null;
  }

  const handleLaunch = async () => {
    if (!launchPayload) return;
    await launchFinetune({
      dataset_id: datasetId,
      launchBody: launchPayload,
    });
  };

  const handleConfirmRemoval = () => {
    if (pendingRemoval === "domain") {
      removeDomainExpansion();
    }
    if (pendingRemoval === "general") {
      removeGeneralExpansion();
    }
    setPendingRemoval(null);
  };

  return (
    <FinetuneStepsContentWrapper className="h-full min-h-0">
      <Dialog
        open={pendingRemoval !== null}
        onOpenChange={(open) => {
          if (!open) setPendingRemoval(null);
        }}
      >
        <DialogContent className="text-center">
          <DialogHeader>
            <DialogTitle>
              Do you want to remove data expansion from your order?
            </DialogTitle>
            <DialogDescription className="text-typography-primary">
              <span className="text-[#FF5A5A]">Warning:</span> the autoscientist
              configurations were made based upon expanded dataset size. We
              recommend going back to update the dataset size and re-optimize
              with AutoScientist. You are unlikely to see good results with less
              data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter
            showCancelButton={false}
            className="grid grid-cols-2 gap-2 sm:justify-center"
          >
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => setPendingRemoval(null)}
            >
              No
            </Button>
            <Button className="w-full" onClick={handleConfirmRemoval}>
              Yes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Button className="w-full" variant="secondary" asChild>
        <Link
          to={`${href(ROUTES.DATASET_FINETUNE_CONFIRM, {
            dataset_id: datasetId,
          })}${search}`}
        >
          <ArrowLeftIcon pathClasses="stroke-current" />
          Back
        </Link>
      </Button>

      <FinetuneStepsContent className="flex h-full flex-col gap-10 overflow-y-auto no-scrollbar">
        <Text variant="h2" className="text-center">
          {userName}, start training frontier models now.
        </Text>

        <div className="grid grid-cols-[1fr_auto_1fr] gap-[32px] items-start">
          <div className="flex flex-col gap-4">
            {shouldShowDomainSlider && (
              <CostItem
                title="Domain dataset expansion"
                value={domainExpansionCost}
                icon={coneImage}
              />
            )}
            {shouldShowGeneralSlider && (
              <CostItem
                title="Diversity dataset expansion"
                value={diversityExpansionCost}
                icon={inclinedCirclesImage}
              />
            )}
            <CostItem
              title="AutoScientist training"
              subtitle={`${autoScientistTrainingCost} ${autoScientistTrainingCost > 0 ? "Credit" : "Credits"}`}
              value={0}
              icon={autoScientistImage}
            />
            <div className="mt-[20px] gap-3 flex flex-col">
              <div className="flex items-center gap-3">
                <RadioGroup
                  value="voucher"
                  className="pointer-events-none flex items-center"
                >
                  <RadioGroupItem value="voucher" />
                </RadioGroup>
                <Text variant="title">Voucher</Text>
              </div>
              <div className="flex flex-row items-end">
                <Text>Enjoy a full month of free AutoScientist</Text>
                <img className="w-[35px]" src={FireIcon} alt="Fire Icon" />
              </div>
              <Input
                label="Voucher"
                value="AdaptYourWorld"
                readOnly
                rightElement={
                  <Text className="flex items-center gap-3 text-[#1A84AE]">
                    <CheckIcon pathClasses="stroke-current" />
                    Activated
                  </Text>
                }
              />
            </div>
          </div>

          <Separator orientation="vertical" color="secondary" />

          <Card className="rounded-[8px] [--hairline-radius:8px] p-8 bg-[linear-gradient(180deg,#FAFAFA_0%,#E7F7FF_50%,#FAFAFA_100%)]">
            <Text variant="title">Order Summary</Text>
            <div className="flex flex-col gap-3">
              {shouldShowDomainSlider && (
                <InfoItem
                  title="Domain data expansion:"
                  value={`${domainExpansionCost.toLocaleString()} Credits`}
                />
              )}
              {shouldShowGeneralSlider && (
                <InfoItem
                  title="Diversity data expansion:"
                  value={`${diversityExpansionCost.toLocaleString()} Credits`}
                />
              )}
              <InfoItem title="AutoScientist training:" value="0 Credits" />
              <InfoItem
                title="Total:"
                value={`${totalOrderCost.toLocaleString()} Credits`}
              />
            </div>

            {isNotEnoughCredits && (
              <div>
                <Text color="secondary" className="mb-1">
                  Current credits: {totalCredits.toLocaleString()}
                </Text>
                <Text variant="subtitle">
                  You need {remainingRequestedCredits.toLocaleString()} more
                  credits to run this job
                </Text>
                <PaymentTopUpForm
                  className="mt-4 gap-2"
                  defaultAmount={remainingRequestedCredits}
                  onSubmit={() => undefined}
                />
              </div>
            )}
          </Card>
        </div>
      </FinetuneStepsContent>

      {isNotEnoughCredits ? (
        <PaymentTopUpDialog
          trigger={
            <Button className="ml-auto w-full" variant="primary">
              Top up <ArrowRightIcon pathClasses="stroke-current" />
            </Button>
          }
        />
      ) : (
        <Button
          type="button"
          className="ml-auto w-full"
          variant="primary"
          isLoading={isLaunching}
          disabled={!launchPayload}
          onClick={() => void handleLaunch()}
        >
          Launch <ArrowRightIcon pathClasses="stroke-current" />
        </Button>
      )}
    </FinetuneStepsContentWrapper>
  );
}
