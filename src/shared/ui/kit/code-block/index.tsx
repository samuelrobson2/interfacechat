import { Link } from "react-router-dom";
import { CopyIcon } from "@/shared/assets/icons/general/Copy";
import { cn } from "@/shared/lib/css";
import { toast } from "../sonner-toast";
import type React from "react";
import { useEffect, useState, type ReactNode } from "react";
import { codeToHtml, type BundledLanguage, type SpecialLanguage } from "shiki";
import { Button } from "../button";

function labelForShikiLanguage(lang: string): string {
  const key = lang.toLowerCase();
  const map: Record<string, string> = {
    python: "Python",
    bash: "cURL",
    typescript: "TypeScript",
    javascript: "JavaScript",
    text: "Text",
  };
  return map[key] ?? lang;
}

export function CodeBlock({
  code,
  language = "text",
  className,
  languageSwitcher,
  link,
  ...rootProps
}: {
  code: string;
  language?: BundledLanguage | SpecialLanguage;
  /** When set, shown next to copy instead of the single language pill (e.g. Python / cURL tabs). */
  languageSwitcher?: ReactNode;
  link?: { name: string; href: string };
} & Omit<React.ComponentProps<"div">, "children">) {
  const [highlightedHtml, setHighlightedHtml] = useState<string>("");

  useEffect(() => {
    let isActive = true;

    codeToHtml(code, {
      lang: language.toLowerCase(),
      theme: "github-light",
    })
      .then((html) => {
        if (isActive) setHighlightedHtml(html);
      })
      .catch(() => {
        if (isActive) setHighlightedHtml("");
      });

    return () => {
      isActive = false;
    };
  }, [code, language]);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success("Code copied successfully");
    } catch {
      toast.error("Failed to copy code");
    }
  };

  return (
    <div
      {...rootProps}
      className={cn(
        "rounded-[8px] border-[0.5px] border-stroke-secondary overflow-hidden bg-background-secondary shadow-inset-default",
        "flex flex-col p-[32px] gap-6",
        className,
      )}
    >
      <div className="flex flex-wrap justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="icon"
            onClick={copyCode}
            aria-label="Copy code"
          >
            <CopyIcon />
          </Button>
          {languageSwitcher ?? (
            <Button
              variant="secondary"
              size="40"
              className="border-stroke-secondary bg-blue-1 text-typography-primary"
            >
              {labelForShikiLanguage(language)}
            </Button>
          )}
        </div>
        {link && (
          <Button variant="secondary" size="40" asChild>
            <Link to={link.href} target="_blank">
              {link.name}
            </Link>
          </Button>
        )}
      </div>

      <div className="min-h-0 overflow-auto">
        {highlightedHtml ? (
          <div
            className="[&_.shiki]:m-0 [&_.shiki]:rounded-none [&_.shiki]:p-4 [&_.shiki]:text-sm [&_.shiki]:leading-6 [&_.shiki]:font-mono "
            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
          />
        ) : (
          <pre className="m-0 p-4 text-sm leading-6">
            <code className="font-mono">{code}</code>
          </pre>
        )}
      </div>
    </div>
  );
}
