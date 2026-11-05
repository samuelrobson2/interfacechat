import { useEffect, useRef, useState } from "react";
import { Badge, Card, CardContent, Separator, Text } from "@/shared/ui/kit";
import { cn } from "@/shared/lib/css";
import { Check, Copy } from "lucide-react";

// Shared building blocks for the UI Kit gallery pages. Each specimen is labelled
// with the exact component name (and, optionally, its import path) so the page
// doubles as a reference for prompting an agent to use or adjust a component.
// Clicking the name copies a ready-to-paste import statement to the clipboard.

const isIdentifier = (s: string) => /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(s);

/** Small clipboard hook with an auto-resetting "copied" flag. */
function useCopyFlag(resetMs = 1400) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const copy = (text: string) => {
    void navigator.clipboard?.writeText(text);
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), resetMs);
  };
  return { copied, copy };
}

/** A single labelled specimen: the component name + one or more live renders. */
export function Specimen({
  name,
  from,
  copy,
  span,
  children,
}: {
  name: string;
  /** Import path shown under the name and used for the copied import, e.g.
   *  "@/shared/ui/kit" (the default). */
  from?: string;
  /** Explicit text to copy instead of the generated import statement. */
  copy?: string;
  span?: boolean;
  children: React.ReactNode;
}) {
  const { copied, copy: doCopy } = useCopyFlag();
  const source = from ?? "@/shared/ui/kit";
  const copyText =
    copy ?? (isIdentifier(name) ? `import { ${name} } from "${source}";` : name);

  return (
    <Card
      variant="outlined"
      spacing="none"
      className={span ? "lg:col-span-2 xl:col-span-3" : undefined}
    >
      <CardContent className="flex h-full flex-col gap-4 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => doCopy(copyText)}
            title={`Copy: ${copyText}`}
            className="group inline-flex cursor-pointer items-center gap-1.5"
          >
            <Badge size="sm" radius="square" color="neutral">
              {`<${name} />`}
            </Badge>
            {copied ? (
              <Check className="size-3.5 text-icon-primary" />
            ) : (
              <Copy className="size-3.5 text-icon-secondary opacity-0 transition-opacity group-hover:opacity-100" />
            )}
          </button>
          {from && (
            <Text variant="label" color="secondary" className="font-bureau text-[12px]">
              {from}
            </Text>
          )}
        </div>
        <div className="flex flex-1 flex-wrap items-center gap-3">{children}</div>
      </CardContent>
    </Card>
  );
}

/** A titled band of specimens laid out in a responsive grid. */
export function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Text variant="title" weight="bold">
          {title}
        </Text>
        <Separator className="flex-1" color="secondary" />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {children}
      </div>
    </section>
  );
}

/** Vertical stack wrapper for a gallery page's sections. */
export function GalleryPage({ children }: { children: React.ReactNode }) {
  return <div className={cn("flex flex-col gap-10")}>{children}</div>;
}
