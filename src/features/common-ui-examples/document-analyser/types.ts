export type DocumentEntry = {
  id: string;
  title: string;
  fileUrl: string;
  // Verbatim strings expected to appear in the PDF's text — only the seed
  // document ships with these; uploaded documents can still be opened and
  // read, just without chat-driven reference highlighting.
  quotes?: string[];
  removable?: boolean;
};

export type OpenTab =
  | { id: string; kind: "document"; docId: string; title: string }
  | { id: string; kind: "graph"; title: string };
