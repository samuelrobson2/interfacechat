import type { ApiSchemas } from "@/shared/api/schema";

/**
 * Mock dataset list for the backend-less demo (DEMO_MODE). `useDatasetsTable`
 * swaps in this response so the Dashboard renders real-looking rows offline.
 * Shaped exactly like GET /datasets so the table/columns work unchanged.
 */

// A generated interface, keyed by the chat session + app it was produced from.
type LatestInterface = { session_id: string; app_id: string };

type Dataset = ApiSchemas["DatasetListItemDto"] & {
  latest_interface?: LatestInterface | null;
};

function makeDataset(d: {
  id: string;
  name: string;
  rows: number;
  status: Dataset["status"];
  type?: Dataset["dataset_type"];
  daysAgo?: number;
  finetune?: NonNullable<Dataset["latest_finetune"]>;
  description?: string;
  latestInterface?: LatestInterface;
  createdAt?: string;
}): Dataset {
  const created =
    d.createdAt ??
    new Date(2026, 5, 24 - (d.daysAgo ?? 0), 9, 30).toISOString();
  const ready = d.status === "ready";
  return {
    dataset_id: d.id,
    organization_id: "org-demo",
    name: d.name,
    row_count: d.rows,
    dataset_type: d.type ?? "tabular",
    kind: "uploaded",
    sources: null,
    status: d.status,
    error_data: null,
    error_message: null,
    columns: null,
    metadata: d.description ? { dataset_description: d.description } : null,
    created_at: created,
    form_responses: [],
    run_id: null,
    processed_rows: ready ? d.rows : Math.round(d.rows * 0.4),
    samples_to_process: d.rows,
    progress_percentage: ready ? 100 : 40,
    latest_finetune: d.finetune ?? null,
    latest_interface: d.latestInterface ?? null,
  };
}

const datasets: Dataset[] = [
  // Showcase row: adaptive data completed, autoscientist available to run, and a
  // generated interface ready to view (the "INTERFACE → View" state).
  makeDataset({
    id: "ds-text-to-mermaid",
    name: "text_to_mermaid",
    rows: 4200,
    status: "ready",
    createdAt: new Date(2026, 6, 13, 9, 30).toISOString(),
    description:
      "This dataset contains pairs of natural language prompts and their " +
      "corresponding Mermaid.js code snippets for generating various diagrams. " +
      "The samples include instructions for creating sequence diagrams, flow " +
      "charts, class diagrams, and entity-relationship diagrams.",
    latestInterface: {
      session_id: "chat-text-to-mermaid",
      app_id: "app-text-to-mermaid",
    },
  }),
  makeDataset({
    id: "ds-quarterly-forecasts",
    name: "Quarterly revenue forecasts",
    rows: 18420,
    status: "ready",
    daysAgo: 1,
    finetune: { status: "succeeded", progress_percentage: 100 },
  }),
  makeDataset({
    id: "ds-customer-churn",
    name: "Customer churn signals",
    rows: 9650,
    status: "ready",
    daysAgo: 3,
  }),
  makeDataset({
    id: "ds-analyst-reports",
    name: "Analyst report summaries",
    rows: 2310,
    status: "ready",
    type: "document",
    daysAgo: 6,
    finetune: { status: "running", progress_percentage: 62 },
  }),
  makeDataset({
    id: "ds-scenario-inputs",
    name: "Scenario stress-test inputs",
    rows: 5400,
    status: "processing",
    daysAgo: 0,
  }),
  makeDataset({
    id: "ds-market-trends",
    name: "Market trend indicators",
    rows: 12880,
    status: "ready",
    daysAgo: 11,
  }),
];

export const MOCK_DATASETS_RESPONSE: ApiSchemas["GetDatasetsResponseDto"] = {
  datasets,
  total: datasets.length,
};

// ---------------------------------------------------------------------------
// Dataset detail (demo). Extra, non-list content used to render the standalone
// mock dataset page at /dataset/:dataset_id when there is no backend.
// ---------------------------------------------------------------------------

export type MockDatasetSampleRow = {
  prompt: string;
  completion: string;
};

export type MockDatasetInterface = {
  id: string;
  title: string;
  /** Chat category slug — drives the card icon/color; unknown values fall back. */
  category?: string;
};

export type MockDatasetMetric = {
  label: string;
  value: string;
  hint?: string;
};

export type MockDatasetDetail = {
  metrics: MockDatasetMetric[];
  domains: string[];
  sampleRows: MockDatasetSampleRow[];
  interfaces: MockDatasetInterface[];
};

const MOCK_DATASET_DETAILS: Record<string, MockDatasetDetail> = {
  "ds-text-to-mermaid": {
    metrics: [
      { label: "Quality score", value: "92", hint: "Top 8% of datasets" },
      { label: "Rows", value: "4,200" },
      { label: "Avg prompt length", value: "148 tokens" },
      { label: "Avg completion length", value: "96 tokens" },
    ],
    domains: ["Software", "Diagramming", "Developer tools"],
    sampleRows: [
      {
        prompt:
          "Draw a sequence diagram for a user logging in through an auth service.",
        completion:
          "sequenceDiagram\n  User->>Frontend: Enter credentials\n  Frontend->>Auth: POST /login\n  Auth-->>Frontend: JWT token\n  Frontend-->>User: Logged in",
      },
      {
        prompt: "Create a flowchart for a support ticket triage process.",
        completion:
          "flowchart TD\n  A[New ticket] --> B{Urgent?}\n  B -- Yes --> C[Escalate]\n  B -- No --> D[Queue]",
      },
      {
        prompt: "Generate a class diagram for an Order and LineItem model.",
        completion:
          "classDiagram\n  Order --> LineItem\n  class Order {\n    +id\n    +total()\n  }",
      },
      {
        prompt: "ER diagram: customers place many orders.",
        completion:
          "erDiagram\n  CUSTOMER ||--o{ ORDER : places\n  ORDER ||--|{ LINE_ITEM : contains",
      },
    ],
    interfaces: [
      {
        id: "if-mermaid-playground",
        title: "Mermaid Playground",
        category: "developer",
      },
    ],
  },
};

export function findMockDataset(datasetId: string | undefined | null) {
  if (!datasetId) return null;
  return datasets.find((d) => d.dataset_id === datasetId) ?? null;
}

export function getMockDatasetDetail(
  datasetId: string | undefined | null,
): MockDatasetDetail | null {
  if (!datasetId) return null;
  return MOCK_DATASET_DETAILS[datasetId] ?? null;
}
