import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

import {
  Plot,
  PlotErrorBlock,
  PlotSkeleton,
} from "../../plot/compose/chat-plot";
import { PLOT_LANGUAGE, parsePlot } from "../../plot/model/plot-schema";

const block = "mb-2 last:mb-0";

/* eslint-disable @typescript-eslint/no-unused-vars */
const createComponents = (isStreaming: boolean): Components => {
  const paragraph: Components["p"] = ({ node, color, ...rest }) => (
    <p {...rest} className={block} />
  );

  return {
    p: paragraph,
    h1: paragraph,
    h2: paragraph,
    h3: paragraph,
    h4: paragraph,
    h5: paragraph,
    h6: paragraph,
    blockquote: ({ children }) => <div className={block}>{children}</div>,
    ul: ({ children }) => <div className={block}>{children}</div>,
    ol: ({ children }) => <div className={block}>{children}</div>,
    li: ({ children }) => <div className={block}>{children}</div>,
    table: ({ children }) => <div className={block}>{children}</div>,
    thead: ({ children }) => <>{children}</>,
    tbody: ({ children }) => <>{children}</>,
    tr: ({ children }) => <p>{children}</p>,
    th: ({ children }) => <span className="mr-4 last:mr-0">{children}</span>,
    td: ({ children }) => <span className="mr-4 last:mr-0">{children}</span>,
    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
    del: ({ children }) => <>{children}</>,
    a: ({ children }) => <>{children}</>,
    hr: () => null,
    img: () => null,
    input: () => null,
    pre: ({ children }) => <>{children}</>,
    code: ({ className, children }) => {
      const text = String(children).replace(/\n$/, "");
      const language = /language-([\w-]+)/.exec(className ?? "")?.[1];

      // Charts are content, not formatting, so they still render.
      if (language === PLOT_LANGUAGE) {
        if (isStreaming) return <PlotSkeleton />;
        const parsed = parsePlot(text);
        if (!parsed.ok) return <PlotErrorBlock error={parsed.error} />;
        return <Plot spec={parsed.spec} />;
      }

      if (language || text.includes("\n")) {
        return <p className={`${block} whitespace-pre-wrap`}>{text}</p>;
      }
      return <span>{text}</span>;
    },
  };
};
/* eslint-enable @typescript-eslint/no-unused-vars */

/** Assistant answers as plain text with bold and italic only. */
export function ChatAssistantMarkdown({
  content,
  isStreaming = false,
}: {
  content: string;
  isStreaming?: boolean;
}) {
  return (
    <div className="relative min-w-0">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={createComponents(isStreaming)}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
