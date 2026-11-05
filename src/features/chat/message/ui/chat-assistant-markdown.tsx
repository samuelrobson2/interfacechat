import { cn } from "@/shared/lib/css";
import { Checkbox } from "@/shared/ui/kit/checkbox";
import { CodeBlock } from "@/shared/ui/kit/code-block";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/kit/table";
import { Text } from "@/shared/ui/kit/text";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import type { BundledLanguage } from "shiki";
import "katex/dist/katex.min.css";
import {
  PLOT_LANGUAGE,
  parsePlot,
} from "../../plot/plot-schema";
import { rehypeMdPositions } from "../lib/rehype-md-positions";
import {
  Plot,
  PlotErrorBlock,
  PlotSkeleton,
} from "../../plot/chat-plot";

const ENABLE_MD_POSITION_HIGHLIGHT: boolean = false;

const getSimpleLinkLabel = (href?: string) => {
  if (!href) return "link";
  try {
    return new URL(href).hostname.replace(/^www\./, "") || "link";
  } catch {
    return "link";
  }
};

// Renders a single markdown block. Extracted so the assistant message can
// render the content in two segments (before/after an inline image unit)
// while sharing the exact same renderer configuration.
export function ChatAssistantMarkdown({
  content,
  shouldUseTwoColumns,
  isHighlightActive,
  isStreaming,
  selectCodeBlock,
}: {
  content: string;
  shouldUseTwoColumns: boolean;
  isHighlightActive: boolean;
  isStreaming: boolean;
  selectCodeBlock: (
    el: HTMLElement,
    code: string,
    start: number,
    end: number,
  ) => void;
}) {
  return (
    <div
      className={cn(
        "relative",
        shouldUseTwoColumns && "columns-2 gap-x-[24px] *:break-inside-avoid",
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={
          ENABLE_MD_POSITION_HIGHLIGHT
            ? [rehypeKatex, rehypeMdPositions]
            : [rehypeKatex]
        }
        /* eslint-disable @typescript-eslint/no-unused-vars */
        components={{
          p: ({ node, color, className, children, ...rest }) => (
            <p
              {...rest}
              className={cn("mb-2 break-inside-avoid-column", className)}
            >
              {children}
            </p>
          ),
          hr: ({ node, color, className, ...rest }) => (
            <hr
              {...rest}
              className={cn("my-2 border-t border-gray-3", className)}
            />
          ),
          h1: ({ node, color, children, ...rest }) => (
            <Text {...rest} as="h1" className="mb-2" variant="h3">
              {children}
            </Text>
          ),
          h2: ({ node, color, children, ...rest }) => (
            <Text {...rest} as="h2" className="mb-2" variant="subtitle">
              {children}
            </Text>
          ),
          h3: ({ node, color, children, ...rest }) => (
            <Text {...rest} as="h3" className="mb-2" variant="subtitle">
              {children}
            </Text>
          ),
          h4: ({ node, color, children, ...rest }) => (
            <Text {...rest} as="h4" className="mb-2" variant="subtitle">
              {children}
            </Text>
          ),
          h5: ({ node, color, children, ...rest }) => (
            <Text {...rest} as="h5" className="mb-2" variant="label">
              {children}
            </Text>
          ),
          h6: ({ node, color, children, ...rest }) => (
            <Text {...rest} as="h6" variant="caption">
              {children}
            </Text>
          ),
          blockquote: ({ node, color, className, children, ...rest }) => (
            <blockquote
              {...rest}
              className={cn(
                "mb-2 border-l-2 border-stroke-secondary pl-3 text-typography-secondary italic",
                className,
              )}
            >
              {children}
            </blockquote>
          ),
          ol: ({ node, color, className, children, ...rest }) => (
            <ol {...rest} className={cn("mb-2 list-decimal pl-4", className)}>
              {children}
            </ol>
          ),
          ul: ({ node, color, className, children, ...rest }) => {
            // GFM task lists are marked with `contains-task-list`; drop the bullet marker.
            const isTaskList = className?.includes("contains-task-list");
            return (
              <ul
                {...rest}
                className={cn(
                  "mb-2 pl-4",
                  isTaskList ? "list-none pl-0" : "list-disc",
                  className,
                )}
              >
                {children}
              </ul>
            );
          },
          li: ({ node, color, className, children, ...rest }) => {
            const isTaskItem = className?.includes("task-list-item");
            return (
              <li
                {...rest}
                className={cn(
                  "mb-1",
                  isTaskItem && "flex items-start gap-2 list-none",
                  className,
                )}
              >
                {children}
              </li>
            );
          },
          strong: ({ node, color, className, children, ...rest }) => (
            <strong {...rest} className={cn("font-semibold", className)}>
              {children}
            </strong>
          ),
          em: ({ node, color, className, children, ...rest }) => (
            <em {...rest} className={cn("italic", className)}>
              {children}
            </em>
          ),
          del: ({ node, color, className, children, ...rest }) => (
            <del {...rest} className={cn("line-through opacity-70", className)}>
              {children}
            </del>
          ),
          input: ({ node, type, checked, disabled, ...rest }) => {
            // Only `type="checkbox"` is emitted by remark-gfm for task lists.
            if (type !== "checkbox") return null;
            // Cherry-pick `data-md-*` only — the Radix Checkbox renders a
            // <button> and won't accept arbitrary <input> attributes.
            const data = rest as Record<string, string | undefined>;
            return (
              <Checkbox
                checked={checked}
                disabled={disabled}
                className="mt-[0.3em] size-4 shrink-0"
                data-md-start={data["data-md-start"]}
                data-md-end={data["data-md-end"]}
              />
            );
          },
          table: ({ node, children, ...rest }) => (
            <Table
              size="compact"
              wrapperClassName={cn(shouldUseTwoColumns && "[column-span:all]")}
              {...rest}
            >
              {children}
            </Table>
          ),
          thead: ({ node, children, ...rest }) => (
            <TableHeader {...rest}>{children}</TableHeader>
          ),
          tbody: ({ node, children, ...rest }) => (
            <TableBody {...rest}>{children}</TableBody>
          ),
          tr: ({ node, children, ...rest }) => (
            <TableRow {...rest}>{children}</TableRow>
          ),
          th: ({ node, children, ...rest }) => (
            <TableHead {...rest}>{children}</TableHead>
          ),
          td: ({ node, children, ...rest }) => (
            <TableCell {...rest}>{children}</TableCell>
          ),
          a: ({ node, color, href, className, ...rest }) => (
            <a
              {...rest}
              href={href}
              target="_blank"
              rel="noreferrer noopener"
              className={cn("underline", className)}
            >
              {getSimpleLinkLabel(href)}
            </a>
          ),
          img: ({ node, color, src, alt, className, ...rest }) => (
            <img
              {...rest}
              src={src ?? ""}
              alt={alt ?? ""}
              className={cn(
                "my-3 block h-auto w-full max-w-full",
                shouldUseTwoColumns && "break-inside-avoid-column",
                className,
              )}
            />
          ),
          pre: ({ node, color, className, children, ...rest }) => (
            // Force code block wrapper to span the full width even in multi-column layout.
            <pre
              {...rest}
              className={cn(
                "my-3",
                shouldUseTwoColumns && "[column-span:all]",
                className,
              )}
            >
              {children}
            </pre>
          ),
          code: ({ node, color, className, children, ...rest }) => {
            const match = /language-([\w-]+)/.exec(className ?? "");
            if (!match) {
              return (
                <code {...rest} className={className}>
                  {children}
                </code>
              );
            }

            const code = String(children).replace(/\n$/, "");
            const language = match[1];
            const data = rest as Record<string, string | undefined>;

            if (language === PLOT_LANGUAGE) {
              const wrapperClass = cn(
                shouldUseTwoColumns && "[column-span:all]",
              );
              const parsed = parsePlot(code);
              let plotContent;
              if (isStreaming) {
                // Defer the heavy recharts mount until streaming finishes.
                // Re-rendering the chart on every streamed token races with
                // the surrounding chat surface's render passes and can
                // trigger DOM mutation errors inside recharts/recharts'
                // ResponsiveContainer. The skeleton is a stable placeholder.
                plotContent = <PlotSkeleton />;
              } else if (parsed.ok) {
                plotContent = <Plot spec={parsed.spec} />;
              } else {
                plotContent = <PlotErrorBlock error={parsed.error} />;
              }
              return (
                <div
                  data-md-start={data["data-md-start"]}
                  data-md-end={data["data-md-end"]}
                  className={wrapperClass}
                >
                  {plotContent}
                </div>
              );
            }

            if (ENABLE_MD_POSITION_HIGHLIGHT) {
              // CodeBlock renders a <div> and won't accept arbitrary <code>
              // attrs, so we pass only the `data-md-*` anchors needed by the
              // highlight feature to map clicks back to source offsets.
              const start = Number(data["data-md-start"]);
              const end = Number(data["data-md-end"]);

              return (
                <CodeBlock
                  className={cn(
                    "p-6",
                    // Ensure code block always renders in a single column inside multi-column text.
                    shouldUseTwoColumns && "[column-span:all]",
                    isHighlightActive &&
                      "cursor-pointer select-none hover:border-blue-5 transition-colors",
                  )}
                  code={code}
                  language={language as BundledLanguage}
                  data-md-start={data["data-md-start"]}
                  data-md-end={data["data-md-end"]}
                  onClick={(e) =>
                    isHighlightActive &&
                    selectCodeBlock(e.currentTarget, code, start, end)
                  }
                />
              );
            }

            // Default: a plain, text-selectable code block
            return (
              <CodeBlock
                className={cn(
                  "p-6",
                  // Ensure code block always renders in a single column inside multi-column text.
                  shouldUseTwoColumns && "[column-span:all]",
                )}
                code={code}
                language={language as BundledLanguage}
              />
            );
          },
        }}
        /* eslint-enable @typescript-eslint/no-unused-vars */
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
