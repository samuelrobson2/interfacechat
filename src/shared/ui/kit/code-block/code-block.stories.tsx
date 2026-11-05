import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "../button";
import { CodeBlock } from ".";
import { DEVELOPER_DOCS_LINK } from "@/shared/model/routes";

const PYTHON_CODE = `import requests

BASE_URL = "https://api.example.com"
DATASET_ID = "123"
TOKEN = "<YOUR_TOKEN>"

response = requests.get(
    f"{BASE_URL}/api/v1/datasets/{DATASET_ID}/status",
    headers={
        "Authorization": f"Bearer {TOKEN}",
        "Content-Type": "application/json",
    },
    timeout=30,
)

print(response.status_code)
print(response.json())`;

const TYPESCRIPT_CODE = `import { useState, useEffect } from "react";

interface Dataset {
  id: string;
  status: "pending" | "ready" | "failed";
  createdAt: Date;
}

async function fetchDataset(id: string): Promise<Dataset> {
  const res = await fetch(\`/api/v1/datasets/\${id}\`, {
    headers: { Authorization: \`Bearer \${process.env.API_TOKEN}\` },
  });
  if (!res.ok) throw new Error(\`HTTP \${res.status}: \${res.statusText}\`);
  return res.json() as Promise<Dataset>;
}

export function useDataset(id: string) {
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchDataset(id).then(setDataset).catch(setError);
  }, [id]);

  return { dataset, error };
}`;

const JAVASCRIPT_CODE = `const BASE_URL = "https://api.example.com";

async function pollStatus(datasetId, maxAttempts = 12, interval = 5000) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const res = await fetch(\`\${BASE_URL}/api/v1/datasets/\${datasetId}/status\`);
    const { status, errorMessage } = await res.json();

    console.log(\`[\${attempt}/\${maxAttempts}] status=\${status}\`);

    if (status === "ready") return true;
    if (status === "failed") throw new Error(errorMessage ?? "Unknown error");

    await new Promise((resolve) => setTimeout(resolve, interval));
  }
  throw new Error("Polling timed out");
}`;

const JSON_CODE = `{
  "dataset": {
    "id": "abc-123",
    "name": "Customer Feedback Q1",
    "status": "ready",
    "createdAt": "2024-01-15T10:30:00Z",
    "meta": {
      "rowCount": 15420,
      "columnCount": 8,
      "sizeBytes": 2048576
    },
    "columns": [
      { "name": "id",        "type": "integer", "nullable": false },
      { "name": "text",      "type": "string",  "nullable": false },
      { "name": "sentiment", "type": "string",  "nullable": true  },
      { "name": "score",     "type": "float",   "nullable": true  }
    ]
  }
}`;

const SQL_CODE = `-- Get top sentiment categories for the last 30 days
SELECT
  d.name                          AS dataset_name,
  f.sentiment,
  COUNT(*)                        AS total_responses,
  ROUND(AVG(f.score)::numeric, 2) AS avg_score,
  MIN(f.created_at)               AS first_seen,
  MAX(f.created_at)               AS last_seen
FROM feedback f
JOIN datasets d ON d.id = f.dataset_id
WHERE
  f.created_at >= NOW() - INTERVAL '30 days'
  AND f.sentiment IS NOT NULL
GROUP BY d.name, f.sentiment
HAVING COUNT(*) > 50
ORDER BY total_responses DESC, avg_score DESC
LIMIT 20;`;

// Avoids ${ } template expression syntax — use $VAR style bash variables
const BASH_CODE = `#!/usr/bin/env bash
set -euo pipefail

API_URL="https://api.example.com"
DATASET_ID=$1

echo "Checking dataset: $DATASET_ID"

for attempt in 1 2 3 4 5 6 7 8 9 10 11 12; do
  STATUS=$(curl -sSf \\
    -H "Authorization: Bearer $API_TOKEN" \\
    "$API_URL/api/v1/datasets/$DATASET_ID/status" | jq -r '.status')

  echo "[$attempt/12] status=$STATUS"

  if [ "$STATUS" = "ready" ]; then
    echo "Dataset ready!"
    exit 0
  fi

  if [ "$STATUS" = "failed" ]; then
    echo "Dataset processing failed" >&2
    exit 1
  fi

  sleep 5
done

echo "Polling timed out" >&2
exit 1`;

// Struct tags with backticks cannot appear in JS template literals — omitted for display
const GO_CODE = `package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

type DatasetStatus struct {
	ID     string
	Status string
	Error  string
}

func pollDataset(ctx context.Context, baseURL, token, id string) (*DatasetStatus, error) {
	client := &http.Client{Timeout: 10 * time.Second}

	for attempt := 1; attempt <= 12; attempt++ {
		url := fmt.Sprintf("%s/api/v1/datasets/%s/status", baseURL, id)
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
		req.Header.Set("Authorization", "Bearer "+token)

		resp, err := client.Do(req)
		if err != nil {
			return nil, err
		}
		defer resp.Body.Close()

		var ds DatasetStatus
		if err := json.NewDecoder(resp.Body).Decode(&ds); err != nil {
			return nil, err
		}

		switch ds.Status {
		case "ready":
			return &ds, nil
		case "failed":
			return nil, fmt.Errorf("dataset failed: %s", ds.Error)
		}
		time.Sleep(5 * time.Second)
	}
	return nil, fmt.Errorf("polling timed out")
}`;

const RUST_CODE = `use reqwest::Client;
use serde::Deserialize;
use std::time::Duration;
use tokio::time::sleep;

#[derive(Debug, Deserialize)]
struct DatasetStatus {
    id: String,
    status: String,
    error_message: Option<String>,
}

async fn poll_dataset(
    client: &Client,
    base_url: &str,
    token: &str,
    dataset_id: &str,
) -> anyhow::Result<DatasetStatus> {
    for attempt in 1..=12 {
        let ds: DatasetStatus = client
            .get(format!("{base_url}/api/v1/datasets/{dataset_id}/status"))
            .bearer_auth(token)
            .send()
            .await?
            .error_for_status()?
            .json()
            .await?;

        println!("[{attempt}/12] status={}", ds.status);

        match ds.status.as_str() {
            "ready" => return Ok(ds),
            "failed" => anyhow::bail!("{}", ds.error_message.unwrap_or_default()),
            _ => sleep(Duration::from_secs(5)).await,
        }
    }
    anyhow::bail!("polling timed out")
}`;

const CSS_CODE = `.code-block {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 2rem;
  border-radius: 4px;
  background-color: #fafafa;
  box-shadow: inset 0 1px 3px rgb(0 0 0 / 0.06);
  overflow: hidden;
}

.code-block__header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.code-block__language-badge {
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.25rem 0.75rem;
  border-radius: 56px;
  background-color: #e7f7ff;
  color: #1a84ae;
}`;

const PYTHON_LONG_CODE = `import time
import requests

BASE_URL = "https://api.example.com"
DATASET_ID = "123"
TOKEN = "<YOUR_TOKEN>"
MAX_ATTEMPTS = 12
POLL_INTERVAL_SECONDS = 5

def get_status(dataset_id: str) -> dict:
    response = requests.get(
        f"{BASE_URL}/api/v1/datasets/{dataset_id}/status",
        headers={"Authorization": f"Bearer {TOKEN}"},
        timeout=30,
    )
    response.raise_for_status()
    return response.json()

for attempt in range(1, MAX_ATTEMPTS + 1):
    payload = get_status(DATASET_ID)
    status = payload.get("status")
    print(f"[{attempt}/{MAX_ATTEMPTS}] status={status}")

    if status == "ready":
        print("Dataset ready")
        break

    if status == "failed":
        raise RuntimeError(payload.get("error_message", "Unknown error"))

    time.sleep(POLL_INTERVAL_SECONDS)`;

const meta: Meta<typeof CodeBlock> = {
  title: "UI/Kit/CodeBlock",
  component: CodeBlock,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[720px]">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    language: {
      control: "text",
      description: "Shiki BundledLanguage or SpecialLanguage identifier",
    },
    code: {
      control: "text",
      description: "Code content rendered in the block",
    },
  },
  args: {
    language: "python",
    code: PYTHON_CODE,
  },
};

export default meta;
type Story = StoryObj<typeof CodeBlock>;

export const Default: Story = {};

export const TypeScript: Story = {
  args: { language: "typescript", code: TYPESCRIPT_CODE },
};

export const JavaScript: Story = {
  args: { language: "javascript", code: JAVASCRIPT_CODE },
};

export const JSON: Story = {
  args: { language: "json", code: JSON_CODE },
};

export const SQL: Story = {
  args: { language: "sql", code: SQL_CODE },
};

export const Bash: Story = {
  args: { language: "bash", code: BASH_CODE },
};

export const Go: Story = {
  args: { language: "go", code: GO_CODE },
};

export const Rust: Story = {
  args: { language: "rust", code: RUST_CODE },
};

export const CSS: Story = {
  args: { language: "css", code: CSS_CODE },
};

export const LongPython: Story = {
  args: { language: "python", code: PYTHON_LONG_CODE },
};

// Showcase: demonstrates languageSwitcher prop — args not applicable
export const WithLanguageSwitcher: Story = {
  render: () => {
    const [lang, setLang] = useState<"python" | "bash">("python");
    return (
      <CodeBlock
        language={lang}
        code={lang === "python" ? PYTHON_CODE : BASH_CODE}
        link={{ name: "Developer Docs", href: DEVELOPER_DOCS_LINK }}
        languageSwitcher={
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="40"
              className={
                lang === "python"
                  ? "border-stroke-secondary bg-blue-1 text-typography-primary"
                  : ""
              }
              onClick={() => setLang("python")}
            >
              Python
            </Button>
            <Button
              variant="secondary"
              size="40"
              className={
                lang === "bash"
                  ? "border-stroke-secondary bg-blue-1 text-typography-primary"
                  : ""
              }
              onClick={() => setLang("bash")}
            >
              cURL
            </Button>
          </div>
        }
      />
    );
  },
};
