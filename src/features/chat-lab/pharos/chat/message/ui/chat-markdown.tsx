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
import { rehypeMdPositions } from "../lib/rehype-md-positions";

const ENABLE_MD_POSITION_HIGHLIGHT: boolean = false;

const noopSelectCodeBlock = () => {};

/**
 * Renders a fenced code block as something other than a code listing. Return
 * `null` to fall through to the default `CodeBlock`. Keeps chart rendering (and
 * its recharts dependency) out of surfaces that never emit charts.
 */
export type CodeFenceRenderer = (fence: {
  language: string;
  code: string;
  isStreaming: boolean;
}) => React.ReactNode | null;

export type MarkdownLinkRenderer = (link: {
  href?: string;
  children: React.ReactNode;
}) => React.ReactNode | undefined;

type RemarkPlugins = NonNullable<
  React.ComponentProps<typeof ReactMarkdown>["remarkPlugins"]
>;

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
export function ChatMarkdown({
  content,
  isHighlightActive = false,
  isStreaming = false,
  selectCodeBlock = noopSelectCodeBlock,
  disableMargins = false,
  renderCodeFence,
  plainCode = false,
  plainLinks = false,
  remarkPlugins = [],
  renderLink,
  className,
}: {
  content: string;
  isHighlightActive?: boolean;
  isStreaming?: boolean;
  selectCodeBlock?: (
    el: HTMLElement,
    code: string,
    start: number,
    end: number,
  ) => void;
  disableMargins?: boolean;
  renderCodeFence?: CodeFenceRenderer;
  /** Fenced code as `<pre><code>` text — no `CodeBlock` and no chart fences. */
  plainCode?: boolean;
  /** Keep markdown/autolink label instead of collapsing the href to a hostname. */
  plainLinks?: boolean;
  remarkPlugins?: RemarkPlugins;
  renderLink?: MarkdownLinkRenderer;
  className?: string;
}) {
  const blockMargin = disableMargins ? "" : "mb-2";

  return (
    <div className={cn("relative min-w-0", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath, ...remarkPlugins]}
        rehypePlugins={
          ENABLE_MD_POSITION_HIGHLIGHT
            ? [rehypeKatex, rehypeMdPositions]
            : [rehypeKatex]
        }
        /* eslint-disable @typescript-eslint/no-unused-vars */
        components={{
          p: ({ node, color, className, children, ...rest }) => (
            <p {...rest} className={cn(blockMargin, className)}>
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
            <Text {...rest} as="h1" className={blockMargin} variant="h3">
              {children}
            </Text>
          ),
          h2: ({ node, color, children, ...rest }) => (
            <Text {...rest} as="h2" className={blockMargin} variant="subtitle">
              {children}
            </Text>
          ),
          h3: ({ node, color, children, ...rest }) => (
            <Text {...rest} as="h3" className={blockMargin} variant="subtitle">
              {children}
            </Text>
          ),
          h4: ({ node, color, children, ...rest }) => (
            <Text {...rest} as="h4" className={blockMargin} variant="subtitle">
              {children}
            </Text>
          ),
          h5: ({ node, color, children, ...rest }) => (
            <Text {...rest} as="h5" className={blockMargin} variant="label">
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
                blockMargin,
                "border-l-2 border-stroke-secondary pl-3 text-typography-secondary italic",
                className,
              )}
            >
              {children}
            </blockquote>
          ),
          ol: ({ node, color, className, children, ...rest }) => (
            <ol
              {...rest}
              className={cn(blockMargin, "list-decimal pl-4", className)}
            >
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
                  blockMargin,
                  "pl-4",
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
            <Table size="compact" {...rest}>
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
          a: ({ node, color, href, className, children, ...rest }) => {
            const customLink = renderLink?.({ href, children });
            if (customLink !== undefined) return customLink;

            return (
              <a
                {...rest}
                href={href}
                target="_blank"
                rel="noreferrer noopener"
                className={cn("underline", className)}
              >
                {plainLinks ? children : getSimpleLinkLabel(href)}
              </a>
            );
          },
          img: ({ node, color, src, alt, className, ...rest }) => (
            <img
              {...rest}
              src={src ?? ""}
              alt={alt ?? ""}
              className={cn("my-3 block h-auto w-full max-w-full", className)}
            />
          ),
          pre: ({ node, color, className, children, ...rest }) => (
            <pre
              {...rest}
              className={cn(
                "my-3 min-w-0 max-w-full overflow-x-auto",
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
            const language = match[1] ?? "";
            const data = rest as Record<string, string | undefined>;

            if (plainCode) {
              return (
                <code {...rest} className={className}>
                  {children}
                </code>
              );
            }

            const customFence = renderCodeFence?.({
              language,
              code,
              isStreaming,
            });
            if (customFence) {
              return (
                <div
                  data-md-start={data["data-md-start"]}
                  data-md-end={data["data-md-end"]}
                >
                  {customFence}
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
                className="p-6"
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
