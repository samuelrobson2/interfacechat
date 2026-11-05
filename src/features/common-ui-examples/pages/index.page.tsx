import { Link } from "react-router-dom";
import { FileSearch } from "lucide-react";
import { Text } from "@/shared/ui/kit/text";
import { Card } from "@/shared/ui/kit/card";
import { ROUTES } from "@/shared/model/routes";

// The gallery's landing page — a simple list of common UI patterns, each its
// own standalone demo. Add new entries here as they're built.

type Example = {
  to: string;
  title: string;
  description: string;
  icon: React.ReactNode;
};

const EXAMPLES: Example[] = [
  {
    to: ROUTES.COMMON_UI_EXAMPLES_DOCUMENT_ANALYSER,
    title: "Document Analyser",
    description:
      "Upload documents on the right, open them or chat with an agent that references and highlights specific passages, with other views (like graphs) opening as their own tabs.",
    icon: <FileSearch className="size-5" />,
  },
];

function CommonUiExamplesIndexPage() {
  return (
    <div className="mx-auto flex h-full w-full max-w-[1200px] flex-col gap-8 overflow-y-auto px-6 py-10 md:px-10 md:py-14">
      <header className="flex flex-col gap-2">
        <Text variant="h1" as="h1" className="max-md:text-[32px]">
          Common UI Examples
        </Text>
        <Text variant="body" color="secondary">
          Small, self-contained demos of common UI patterns — a reference for
          building screens or prompting an agent to reuse a pattern.
        </Text>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {EXAMPLES.map((example) => (
          <Link key={example.to} to={example.to}>
            <Card className="flex h-full flex-col gap-3 p-5 transition-colors hover:bg-gray-1">
              <div className="flex size-9 items-center justify-center rounded-full bg-gray-2 text-typography-secondary">
                {example.icon}
              </div>
              <Text variant="label">{example.title}</Text>
              <Text variant="caption" color="secondary">
                {example.description}
              </Text>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

export const Component = CommonUiExamplesIndexPage;
