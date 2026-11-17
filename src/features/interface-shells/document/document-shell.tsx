import { suggestionText } from "../ui/suggested-chip";
import { useMemo } from "react";
import { parseBlocks, plainText } from "../model/markdown-blocks";
import type { DocumentShellData, ShellProps } from "../model/shell-types";
import { DocumentAppIcon, ShellGlyph } from "../ui/shell-icons";
import { useShellMark } from "../ui/shell-mark";
import { ShellFooter } from "../ui/shell-meta";
import { Bar, barWidths, ShellSurface } from "../ui/shell-surface";
import { DocumentEditor } from "./document-editor";
import { PreviewBody, PreviewHead, SHELL_TITLE_GLYPH } from "../ui/shell-kit";

type OutlineLine =
  | { kind: "heading"; width: number }
  | { kind: "text"; width: number }
  | { kind: "bullet"; width: number }
  | { kind: "figure" }
  | { kind: "gap" };

const MAX_LINES = 7;

/** The document's real shape (headings, paragraphs, lists) as placeholder ink. */
function outlineFor(body: string): OutlineLine[] | null {
  if (!body.trim()) return null;
  const lines: OutlineLine[] = [];
  for (const block of parseBlocks(body)) {
    const text = plainText(block.text);
    if (block.type === "embed") {
      lines.push({ kind: "figure" });
      if (lines.length >= MAX_LINES) break;
      continue;
    }
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

  return (
    <>
      <PreviewHead kind="document" title={data.title} />
      <PreviewBody>
        <div className="flex flex-col gap-1">
          {!data.body.trim() ? (
            EMPTY_LINES.map((width, i) => <Bar key={i} width={width} />)
          ) : outline
            ? outline.map((line, i) => {
                if (line.kind === "gap") return <span key={i} className="h-0.5" />;
                // A live piece: a small chart shape.
                if (line.kind === "figure") {
                  return (
                    <span key={i} className="my-0.5 flex h-5 shrink-0 items-end gap-[3px] rounded-[4px] bg-shell-fill px-1.5 pb-1">
                      {[45, 70, 55, 90, 65].map((h, j) => (
                        <span key={j} className="w-1.5 rounded-[1px] bg-blue-4/45" style={{ height: `${h}%` }} />
                      ))}
                    </span>
                  );
                }
                if (line.kind === "heading") {
                  return <Bar key={i} width={line.width} className="h-1.5 bg-blue-5/35" />;
                }
                if (line.kind === "bullet") {
                  return (
                    <span key={i} className="flex items-center gap-1">
                      <span className="size-1 shrink-0 rounded-full bg-shell-ink-soft" />
                      <Bar width={line.width} className="bg-shell-ink-faint" />
                    </span>
                  );
                }
                return <Bar key={i} width={line.width} className="bg-shell-ink-faint" />;
              })
            : EMPTY_LINES.map((width, i) => <Bar key={i} width={width} />)}
        </div>
      </PreviewBody>
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
          titleMark={mark && <ShellGlyph kind="document" className={SHELL_TITLE_GLYPH} />}
          data={data}
          onChange={onChange}
          onSubmit={onSubmit}
          status={status}
          actions={actions}
          tools={tools}
          suggestions={suggestions}
          suggestedText={suggested?.text}
          lengthGuess={suggested?.lengths?.[0] && suggestionText(suggested.lengths[0])}
        />
      </ShellSurface>
    );
  }

  return (
    <ShellSurface size={size} surface={surface} className={className}>
      <DocumentEditor
        density="comfortable"
        titleMark={mark && <ShellGlyph kind="document" className={SHELL_TITLE_GLYPH} />}
        data={data}
        onChange={onChange}
        onSubmit={onSubmit}
        status={status}
        actions={actions}
        tools={tools}
        suggestions={suggestions}
        suggestedText={suggested?.text}
      />
    </ShellSurface>
  );
}
