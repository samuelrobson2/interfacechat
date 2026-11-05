import {
  buildDatasetSnippetItems,
  useDatasetSnippetQuery,
} from "@/services/dataset";
import { CodeBlock } from "@/shared/ui/kit/code-block";
import { useState } from "react";
import { useDatasetDataSuspense } from "../model/use-dataset-data-suspense";
import { DatasetNotReadyCard } from "../ui/dataset-not-ready-card";
import type { BundledLanguage, SpecialLanguage } from "shiki";
import { ButtonGroup } from "@/shared/ui/kit/button-group";
import { Button } from "@/shared/ui/kit/button";
import { cn } from "@/shared/lib/css";
import { DEVELOPER_DOCS_LINK } from "@/shared/model/routes";

export function DatasetApi() {
  const { dataset } = useDatasetDataSuspense();
  const { data: payload } = useDatasetSnippetQuery(dataset.dataset_id);
  const [selectedKey, setSelectedKey] = useState("");

  const snippets = payload
    ? buildDatasetSnippetItems(payload, dataset.dataset_id)
    : [];

  const selected =
    snippets.find((s) => s.key === selectedKey) ?? snippets[0] ?? null;

  if (!selected) return <DatasetNotReadyCard />;

  return (
    <CodeBlock
      language={selected.shikiLang as BundledLanguage | SpecialLanguage}
      code={selected.code}
      className="max-h-[calc(100vh-310px)]"
      link={{ name: "Developer Docs", href: DEVELOPER_DOCS_LINK }}
      languageSwitcher={
        snippets.length > 1 && (
          <ButtonGroup orientation="horizontal">
            {snippets.reverse().map((s) => (
              <Button
                key={s.key}
                variant="secondary"
                size="40"
                className={cn(
                  selected.key === s.key && "bg-blue-1 text-typography-primary",
                )}
                onClick={() => setSelectedKey(s.key)}
              >
                {s.language}
              </Button>
            ))}
          </ButtonGroup>
        )
      }
    />
  );
}
