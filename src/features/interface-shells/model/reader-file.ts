/**
 * Read a file someone drops into the Reader into passages it can show and
 * highlight. PDFs go through pdf.js, loaded only when a PDF is opened.
 */
export type ReadFile = { source: string; title: string; pages?: number; passages: string[] };

/** Split running text into paragraph-sized passages. */
export function toPassages(text: string): string[] {
  const blocks = text
    .replace(/\r/g, "")
    .split(/\n\s*\n/)
    .map((block) => block.replace(/\s*\n\s*/g, " ").replace(/\s{2,}/g, " ").trim())
    .filter(Boolean);
  // A PDF often has no blank lines: break long runs at sentence ends near 600 characters.
  return blocks.flatMap((block) => {
    if (block.length <= 900) return [block];
    const parts: string[] = [];
    let rest = block;
    while (rest.length > 900) {
      const cut = rest.slice(0, 700).lastIndexOf(". ");
      const at = cut > 200 ? cut + 1 : 700;
      parts.push(rest.slice(0, at).trim());
      rest = rest.slice(at).trim();
    }
    if (rest) parts.push(rest);
    return parts;
  });
}

async function pdfText(file: File) {
  const [pdfjs, worker] = await Promise.all([
    import("pdfjs-dist"),
    import("pdfjs-dist/build/pdf.worker.min.mjs?url"),
  ]);
  pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
  const doc = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
  const pages: string[] = [];
  for (let n = 1; n <= doc.numPages; n += 1) {
    const page = await doc.getPage(n);
    const content = await page.getTextContent();
    let text = "";
    for (const item of content.items) {
      if (!("str" in item)) continue;
      text += item.str;
      text += item.hasEOL ? "\n" : " ";
    }
    pages.push(text);
  }
  return { text: pages.join("\n\n"), pages: doc.numPages };
}

export async function readFile(file: File): Promise<ReadFile> {
  const title = file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
  if (file.type === "application/pdf" || /\.pdf$/i.test(file.name)) {
    const { text, pages } = await pdfText(file);
    return { source: file.name, title, pages, passages: toPassages(text) };
  }
  return { source: file.name, title, passages: toPassages(await file.text()) };
}
