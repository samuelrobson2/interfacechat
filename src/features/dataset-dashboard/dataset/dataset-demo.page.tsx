import {
  ChildPageHeader,
  ChildPageLayout,
} from "@/shared/ui/child-page-layout";
import { BreadcrumbTrail } from "@/shared/ui/kit-additions";
import { Button } from "@/shared/ui/kit/button";
import { Separator } from "@/shared/ui/kit/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/kit/tabs";
import { Text } from "@/shared/ui/kit/text";
import { toast } from "@/shared/ui/kit/sonner-toast";
import { useParams } from "react-router-dom";
import type { DatasetRoutes, PathParams } from "@/shared/model/routes";
import { DatasetKindBadge } from "../datasets/ui/dataset-kind-badge";
import {
  findMockDataset,
  getMockDatasetDetail,
} from "../datasets/model/datasets-mock-data";
import { useDatasetTabs } from "./model/use-dataset-tabs";
import { DatasetInterfacesDemo } from "./compose/dataset-interfaces-demo";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function MetricTile({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="flex min-w-[160px] flex-1 flex-col gap-1 rounded-[16px] border border-stroke-secondary bg-background-primary p-4">
      <Text variant="caption" color="secondary">
        {label}
      </Text>
      <Text variant="h3" as="span">
        {value}
      </Text>
      {hint && (
        <Text variant="caption" color="secondary">
          {hint}
        </Text>
      )}
    </div>
  );
}

/**
 * Backend-less demo page for /dataset/:dataset_id. The real page streams every
 * tab from suspense queries that require a backend; this renders representative
 * mock content so the route is navigable offline.
 */
export function DatasetDemoPage() {
  const { tab, handleTabChange } = useDatasetTabs();
  const { dataset_id } = useParams<PathParams[DatasetRoutes]>();
  const dataset = findMockDataset(dataset_id);
  const detail = getMockDatasetDetail(dataset_id);

  const name = dataset?.name ?? dataset_id ?? "Dataset";
  const description =
    dataset?.metadata?.dataset_description ??
    "A demo dataset rendered from mock data.";

  return (
    <ChildPageLayout>
      <ChildPageHeader>
        {/* The trail doubles as this page's h1 — the dataset name is both the
            title and the last crumb, so rendering them separately would say it
            twice. Only the Dashboard sits behind this page, so the trail is a
            back arrow plus the name, and carries the back link itself. */}
        <BreadcrumbTrail
          size="title"
          items={[{ id: "dataset", label: name }]}
          className="min-w-0 flex-1"
        />
      </ChildPageHeader>

      <Tabs
        className="w-full min-w-0 gap-10 overflow-hidden"
        value={tab}
        onValueChange={handleTabChange}
      >
        <TabsList>
          <TabsTrigger value="measure">Measure</TabsTrigger>
          <TabsTrigger value="view">View</TabsTrigger>
          <TabsTrigger value="share">Share</TabsTrigger>
          <TabsTrigger value="finetune">AutoScientist</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
          <TabsTrigger value="interfaces">Interfaces</TabsTrigger>
        </TabsList>

        {/* ---- Measure ---- */}
        <TabsContent value="measure" className="flex flex-col gap-10">
          <div className="flex flex-col gap-4 rounded-[16px] border border-stroke-secondary bg-background-primary p-6">
            <div className="flex flex-wrap items-center gap-3">
              <DatasetKindBadge kind={dataset?.kind ?? "uploaded"} />
              <Text variant="caption" color="secondary">
                {dataset?.row_count?.toLocaleString() ?? "—"} rows
              </Text>
              <Text variant="caption" color="secondary">
                ·{" "}
                {dataset?.created_at
                  ? formatDate(dataset.created_at)
                  : "—"}
              </Text>
            </div>
            <Text variant="body" color="secondary">
              {description}
            </Text>
          </div>

          {detail && (
            <>
              <div className="flex flex-wrap gap-4">
                {detail.metrics.map((m) => (
                  <MetricTile
                    key={m.label}
                    label={m.label}
                    value={m.value}
                    hint={m.hint}
                  />
                ))}
              </div>

              <div className="flex flex-col gap-3">
                <Text variant="label">Domains</Text>
                <div className="flex flex-wrap gap-2">
                  {detail.domains.map((d) => (
                    <span
                      key={d}
                      className="rounded-full border border-stroke-secondary px-3 py-1 text-typography-secondary"
                    >
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}
        </TabsContent>

        {/* ---- View ---- */}
        <TabsContent value="view">
          {detail ? (
            <div className="flex flex-col gap-4">
              {detail.sampleRows.map((row, i) => (
                <div
                  key={i}
                  className="grid gap-4 rounded-[16px] border border-stroke-secondary bg-background-primary p-4 md:grid-cols-2"
                >
                  <div className="flex flex-col gap-1">
                    <Text variant="caption" color="secondary">
                      PROMPT
                    </Text>
                    <Text variant="body">{row.prompt}</Text>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Text variant="caption" color="secondary">
                      COMPLETION
                    </Text>
                    <pre className="overflow-x-auto rounded-[8px] bg-gray-2/50 p-3 text-[13px] leading-relaxed">
                      {row.completion}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Text variant="body" color="secondary">
              No sample rows available.
            </Text>
          )}
        </TabsContent>

        {/* ---- Share ---- */}
        <TabsContent value="share" className="flex flex-col gap-4">
          <Text variant="body" color="secondary">
            Export this dataset to your favorite platform.
          </Text>
          <div className="flex flex-wrap gap-3">
            {["Hugging Face", "Kaggle", "Google Sheets"].map((p) => (
              <Button
                key={p}
                type="button"
                variant="secondary"
                size="40"
                radius="rounded"
                onClick={() => toast.success(`Exporting to ${p}… (demo)`)}
              >
                Export to {p}
              </Button>
            ))}
          </div>
        </TabsContent>

        {/* ---- AutoScientist ---- */}
        <TabsContent value="finetune" className="flex flex-col gap-4">
          <Text variant="body" color="secondary">
            AutoScientist runs a fine-tune and evaluation pipeline on this
            dataset, then reports win rates against the base model.
          </Text>
          <Button
            type="button"
            variant="primary"
            size="40"
            radius="rounded"
            className="self-start"
            onClick={() => toast.success("Starting AutoScientist… (demo)")}
          >
            Configure AutoScientist
          </Button>
        </TabsContent>

        {/* ---- API ---- */}
        <TabsContent value="api" className="flex flex-col gap-4">
          <Text variant="body" color="secondary">
            Pull this dataset programmatically.
          </Text>
          <pre className="overflow-x-auto rounded-[12px] border border-stroke-secondary bg-gray-2/50 p-4 text-[13px] leading-relaxed">
            {`curl https://api.adaption.ai/v1/datasets/${dataset_id} \\\n  -H "Authorization: Bearer $ADAPTION_API_KEY"`}
          </pre>
        </TabsContent>

        {/* ---- Interfaces ---- */}
        <TabsContent value="interfaces">
          <Separator
            color="secondary"
            className="mb-8 data-[orientation=horizontal]:h-[0.5px]"
          />
          <DatasetInterfacesDemo initialInterfaces={detail?.interfaces ?? []} />
        </TabsContent>
      </Tabs>
    </ChildPageLayout>
  );
}
