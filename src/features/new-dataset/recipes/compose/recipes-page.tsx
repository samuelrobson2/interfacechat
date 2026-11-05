import { datasetQueryOptions } from "@/services/dataset";
import { paymentQueryOptions, useSubscriptionData } from "@/services/payment";
import { PlansListDialog } from "@/services/plans";
import type { ApiSchemas } from "@/shared/api/schema";
import { LockIcon } from "@/shared/assets/icons/general/Lock";
import { type DatasetRoutes, type PathParams } from "@/shared/model/routes";
import { Badge } from "@/shared/ui/kit/badge";
import { Card } from "@/shared/ui/kit/card";
import { Separator } from "@/shared/ui/kit/separator";
import { useSuspenseQueries } from "@tanstack/react-query";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { NewDatasetBackButton } from "../../_compose/new-dataset-back-button";
import { NewDatasetContinueButton } from "../../_compose/new-dataset-continue-button";
import { NEW_DATASET_KEYS } from "../../_lib/new-dataset-routes";
import {
  NewDatasetStepsContent,
  NewDatasetStepsContentWrapper,
} from "../../_ui/new-dataset-steps-layout";
import { RecipesProvider, useRecipesContext } from "../model/recipes-store";
import { useRecipesData } from "../model/use-recipes-data";
import { useRecipesPost } from "../model/use-recipes-post";
import { RecipesSettingsItem } from "../ui/recipes-settings-item";

export function RecipesPage() {
  const { dataset_id } = useParams<PathParams[DatasetRoutes]>();
  const [
    { data: stepData },
    { data: subscriptions },
    { data: activeGrantedPlan },
  ] = useSuspenseQueries({
    queries: [
      datasetQueryOptions.step(dataset_id!, NEW_DATASET_KEYS.recipes),
      paymentQueryOptions.subscription(),
      paymentQueryOptions.activeGrantedPlan(),
    ],
  });

  const fields = Object.values(stepData.step.fields).reduce(
    (acc, field) => {
      acc[field.key] = field.response_values?.[0]?.value.toString() || "false";
      return acc;
    },
    {} as Record<string, string>,
  );

  return (
    <RecipesProvider fields={fields}>
      <RecipesConsumer
        subscriptions={subscriptions}
        activeGrantedPlan={activeGrantedPlan}
      />
    </RecipesProvider>
  );
}

function RecipesConsumer({
  subscriptions,
  activeGrantedPlan,
}: {
  subscriptions: ApiSchemas["SubscriptionListResponseDto"];
  activeGrantedPlan: ApiSchemas["ActiveGrantedPlanResponseDto"];
}) {
  const [plansOpen, setPlansOpen] = useState(false);
  const { columns } = useRecipesData();
  const { checkAccess } = useSubscriptionData(subscriptions, activeGrantedPlan);

  const { submitForm, isPending } = useRecipesPost();

  const fields = useRecipesContext((state) => state.fields);
  const setFieldWithRelation = useRecipesContext(
    (state) => state.setFieldWithRelation,
  );

  return (
    <NewDatasetStepsContentWrapper>
      <NewDatasetBackButton stepKey={NEW_DATASET_KEYS.recipes} />

      <NewDatasetStepsContent className="flex flex-col h-full">
        <Card className="flex-row gap-8 rounded-[8px] [--hairline-radius:8px] p-8 h-fit">
          <div className="flex-1 flex flex-col gap-8">
            {columns?.[0]?.items.map((item) => (
              <RecipesSettingsItem
                key={item.id}
                title={item.title}
                description={item.description || ""}
                checked={fields[item.key] === "true"}
                isEditable={item.enabled ?? true}
                onToggle={(checked) =>
                  setFieldWithRelation(
                    item.key,
                    checked ? "true" : "false",
                    item.relation,
                  )
                }
              />
            ))}
          </div>

          <Separator orientation="vertical" color="secondary" />

          <div className="flex-1 flex flex-col gap-8">
            {columns?.[1]?.items.map((item) => {
              const hasAccess = checkAccess(item.required_plans);
              const renderBadge = item.enabled ? !hasAccess : true;
              const buttonText = !item.enabled ? (
                "Coming soon"
              ) : (
                <button type="button" onClick={() => setPlansOpen(true)}>
                  Plus only
                </button>
              );

              return (
                <RecipesSettingsItem
                  key={item.id}
                  checked={fields[item.key] === "true"}
                  onToggle={(checked) =>
                    setFieldWithRelation(
                      item.key,
                      checked ? "true" : "false",
                      item.relation,
                    )
                  }
                  title={item.title}
                  description={item.description || ""}
                  badge={
                    renderBadge && (
                      <Badge className="shadow-inset-default py-1.5" size="sm">
                        <LockIcon className="size-5" />
                        {buttonText}
                      </Badge>
                    )
                  }
                />
              );
            })}
          </div>
        </Card>
      </NewDatasetStepsContent>

      <NewDatasetContinueButton
        stepKey={NEW_DATASET_KEYS.recipes}
        isLoading={isPending}
        onClick={submitForm}
      />

      <PlansListDialog open={plansOpen} onOpenChange={setPlansOpen} />
    </NewDatasetStepsContentWrapper>
  );
}
