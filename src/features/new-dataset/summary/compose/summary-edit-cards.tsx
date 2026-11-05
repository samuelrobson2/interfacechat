import { DatasetTagsCard, DatasetTagsCardContent } from "@/services/dataset";
import boyBirthdayPartyGreenImage from "@/shared/assets/images/boy-birthday-party-green.svg";
import businessAgreementImage from "@/shared/assets/images/business-agreement.svg";
import chefCookingFoodImage from "@/shared/assets/images/chef-cooking-food.svg";
import { Badge, type BadgeColors } from "@/shared/ui/kit/badge";
import {
  NEW_DATASET_KEYS,
  type NewDatasetKeys,
} from "../../_lib/new-dataset-routes";
import { useSummaryStepQuery } from "../model/use-summary-step-query";
import { SummaryEditButton } from "../ui/summary-edit-button";

type SummaryStepKeys = Extract<
  NewDatasetKeys,
  "recipes" | "brand" | "expansion"
>;

const mapStepToData: Record<
  SummaryStepKeys,
  {
    title: string;
    icon: React.ReactNode;
    color: BadgeColors;
    useBadge: boolean;
  }
> = {
  [NEW_DATASET_KEYS.recipes]: {
    title: "Recipes",
    icon: (
      <img
        className="size-25 self-center"
        src={chefCookingFoodImage}
        alt="Chef Cooking Food"
      />
    ),
    color: "default",
    useBadge: true,
  },
  [NEW_DATASET_KEYS.brand]: {
    title: "Brand",
    icon: (
      <img
        className="size-25 self-center"
        src={businessAgreementImage}
        alt="Business Agreement"
      />
    ),
    color: "default",
    useBadge: false,
  },
  [NEW_DATASET_KEYS.expansion]: {
    title: "Expand",
    icon: (
      <img
        className="size-25 self-center"
        src={boyBirthdayPartyGreenImage}
        alt="Boy Birthday Party"
      />
    ),
    color: "default",
    useBadge: false,
  },
};

export function SummaryEditCards() {
  const { summaryData, showSummaryCards } = useSummaryStepQuery();

  if (!showSummaryCards) return null;

  return (
    <div className="flex gap-4 justify-center">
      {summaryData.map((step) => {
        if (!step) return null;

        const { title, icon, useBadge, color } =
          mapStepToData[step.key as SummaryStepKeys];

        return (
          <DatasetTagsCard
            key={step.key}
            title={title}
            icon={icon}
            action={
              <SummaryEditButton
                className="self-start"
                stepKey={step.key as NewDatasetKeys}
              />
            }
            className="flex-[0.5]"
          >
            {useBadge && <Badge color={color!}>{step.value[0]} Recipes</Badge>}
            {!useBadge && (
              <DatasetTagsCardContent variant="wrap">
                {step.value.map((brand) => (
                  <Badge color={color!} key={brand}>
                    {brand}
                  </Badge>
                ))}
              </DatasetTagsCardContent>
            )}
          </DatasetTagsCard>
        );
      })}
    </div>
  );
}
