import { useMemo } from "react";
import { cn } from "@/shared/lib/css";
import { parseBlocks, plainText } from "../model/markdown-blocks";
import type { DocumentShellData, ShellProps } from "../model/shell-types";
import { DocumentAppIcon, ShellGlyph } from "../ui/shell-icons";
import { useShellMark } from "../ui/shell-mark";
import { ShellFooter } from "../ui/shell-meta";
import { Bar, barWidths, ShellSurface } from "../ui/shell-surface";
import { DocumentEditor } from "./document-editor";

type OutlineLine =
  | { kind: "heading"; width: number }
  | { kind: "text"; width: number }
  | { kind: "bullet"; width: number }
  | { kind: "gap" };

const MAX_LINES = 7;

/** The document's real shape (headings, paragraphs, lists) as placeholder ink. */
function outlineFor(body: string): OutlineLine[] | null {
  if (!body.trim()) return null;
  const lines: OutlineLine[] = [];
  for (const block of parseBlocks(body)) {
    const text = plainText(block.text);
    if (block.type === "heading1" || block.type === "heading2") {
      if (lines.length > 0) lines.push({ kind: "gap" });
      lines.push({ kind: "heading", width: Math.min(78, Math.max(34, text.length * 2.6)) });
    } else if (block.type === "bullet" || block.type === "numbered") {
      lines.push({ kind: "bullet", width: Math.min(84, Math.max(36, text.length * 1.8)) });
    } else if (text) {
      const count = Math.min(3, Math.max(1, Math.ceil(text.length / 70)));
      for (const width of barWidths(text, count)) lines.push({ kind: "text", width });
    }
    if (lines.length >= MAX_LINES) break;
  }
  return lines.slice(0, MAX_LINES);
}

const EMPTY_LINES = [100, 92, 80, 88, 55, 70];

function DocumentPreview({ data }: { data: DocumentShellData }) {
  const outline = useMemo(() => outlineFor(data.body), [data.body]);
  const hasTitle = Boolean(data.title.trim());

  return (
    <>
      <div className="flex shrink-0 items-center gap-1.5 px-2.5 pt-2">
        <ShellGlyph kind="document" className="size-3.5" />
        <div
          className={cn(
            "min-w-0 flex-1 truncate font-bureau text-[12px] leading-[1.3]",
            hasTitle ? "font-normal text-typography-primary" : "font-light text-typography-secondary",
          )}
        >
          {hasTitle ? data.title : "Document"}
        </div>
      </div>
      <div aria-hidden className="mt-1 flex h-5 shrink-0 items-center gap-1 border-b border-gray-3/15 px-2.5">
        {["B", "I", "H"].map((label) => (
          <span
            key={label}
            className={cn(
              "flex size-4 items-center justify-center font-bureau text-[9px] text-typography-secondary",
              label === "B" && "font-bold",
              label === "I" && "italic",
              label === "H" && "font-semibold",
            )}
          >
            {label}
          </span>
        ))}
        <span className="mx-0.5 h-3 w-px bg-gray-3/25" />
        <span className="flex flex-col gap-[2px]">
          <span className="h-px w-3 bg-gray-3" />
          <span className="h-px w-3 bg-gray-3" />
          <span className="h-px w-2 bg-gray-3" />
        </span>
      </div>
      <div
        className={cn(
          "mx-2 mt-1.5 flex min-h-0 flex-1 flex-col overflow-hidden rounded-[10px] bg-white px-2.5 py-2 shadow-[0_1px_2px_rgba(26,23,24,0.06)]",
          "mb-2",
        )}
      >
        <div className="flex flex-col gap-1">
          {!data.body.trim() ? (
            EMPTY_LINES.map((width, i) => <Bar key={i} width={width} />)
          ) : outline
            ? outline.map((line, i) => {
                if (line.kind === "gap") return <span key={i} className="h-0.5" />;
                if (line.kind === "heading") {
                  return <Bar key={i} width={line.width} className="h-1.5 bg-blue-5/35" />;
                }
                if (line.kind === "bullet") {
                  return (
                    <span key={i} className="flex items-center gap-1">
                      <span className="size-1 shrink-0 rounded-full bg-gray-3/45" />
                      <Bar width={line.width} className="bg-gray-3/25" />
                    </span>
                  );
                }
                return <Bar key={i} width={line.width} className="bg-gray-3/25" />;
              })
            : EMPTY_LINES.map((width, i) => <Bar key={i} width={width} />)}
        </div>
      </div>
      <ShellFooter compact className="mx-2.5 mb-2" />
    </>
  );
}

export function DocumentShell({
  size,
  data,
  onChange,
  onSubmit,
  status,
  surface = true,
  actions,
  tools,
  suggestions,
  suggested,
  className,
}: ShellProps<DocumentShellData>) {
  const mark = useShellMark(size);
  if (size === "small") return <DocumentAppIcon className={className} />;

  if (size === "medium") {
    return (
      <ShellSurface size={size} surface={surface} className={className}>
        <DocumentPreview data={data} />
      </ShellSurface>
    );
  }

  if (size === "medium-plus") {
    return (
      <ShellSurface size={size} surface={surface} className={className}>
        <DocumentEditor
          density="compact"
          titleMark={mark && <ShellGlyph kind="document" className="size-4" />}
          data={data}
          onChange={onChange}
          onSubmit={onSubmit}
          status={status}
          suggestions={suggestions}
          lengthGuess={suggested?.lengths?.[0]}
        />
      </ShellSurface>
    );
  }

  return (
    <ShellSurface size={size} surface={surface} className={className}>
      <DocumentEditor
        density="comfortable"
        titleMark={mark && <ShellGlyph kind="document" className="size-7" />}
        data={data}
        onChange={onChange}
        onSubmit={onSubmit}
        status={status}
        actions={actions}
        tools={tools}
        suggestions={suggestions}
      />
    </ShellSurface>
  );
}
