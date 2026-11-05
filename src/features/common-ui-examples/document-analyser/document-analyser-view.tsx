import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Text } from "@/shared/ui/kit/text";
import { ROUTES } from "@/shared/model/routes";
import { ChatPanel, SEED_DOCUMENT_QUOTES } from "./chat-panel";
import { UploadPanel } from "./upload-panel";
import { TabStrip } from "./tab-strip";
import { PdfHighlightViewer } from "./pdf-viewer";
import { GraphTab } from "./graph-tab";
import type { DocumentEntry, OpenTab } from "./types";

// NB: this project's BASE_URL is "/app" with no trailing slash, so join carefully.
const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const SEED_DOC_ID = "attention-paper";
const SEED_DOCUMENT: DocumentEntry = {
  id: SEED_DOC_ID,
  title: "Attention Is All You Need.pdf",
  fileUrl: `${BASE}/attention-is-all-you-need.pdf`,
  quotes: SEED_DOCUMENT_QUOTES,
};

let graphCounter = 0;

export function DocumentAnalyserView() {
  const [documents, setDocuments] = useState<DocumentEntry[]>([SEED_DOCUMENT]);
  const [tabs, setTabs] = useState<OpenTab[]>([
    { id: `doc-${SEED_DOC_ID}`, kind: "document", docId: SEED_DOC_ID, title: SEED_DOCUMENT.title },
  ]);
  const [activeTabId, setActiveTabId] = useState<string | null>(`doc-${SEED_DOC_ID}`);
  const [activeQuote, setActiveQuote] = useState<string | null>(null);

  // Object URLs created for uploaded files — revoked on removal/unmount.
  const objectUrls = useRef<Set<string>>(new Set());
  useEffect(() => {
    return () => {
      objectUrls.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const openDocumentTab = (doc: DocumentEntry) => {
    const tabId = `doc-${doc.id}`;
    setTabs((prev) =>
      prev.some((t) => t.id === tabId)
        ? prev
        : [...prev, { id: tabId, kind: "document", docId: doc.id, title: doc.title }],
    );
    setActiveTabId(tabId);
  };

  const handleReference = (docId: string, quote: string) => {
    const doc = documents.find((d) => d.id === docId);
    if (doc) openDocumentTab(doc);
    setActiveQuote(quote);
  };

  const handleUpload = (files: File[]) => {
    const newDocs: DocumentEntry[] = files.map((file) => {
      const url = URL.createObjectURL(file);
      objectUrls.current.add(url);
      return {
        id: `upload-${crypto.randomUUID()}`,
        title: file.name,
        fileUrl: url,
        removable: true,
      };
    });
    setDocuments((prev) => [...prev, ...newDocs]);
    if (newDocs[0]) openDocumentTab(newDocs[0]);
  };

  const handleRemoveDocument = (docId: string) => {
    const doc = documents.find((d) => d.id === docId);
    if (doc && objectUrls.current.has(doc.fileUrl)) {
      URL.revokeObjectURL(doc.fileUrl);
      objectUrls.current.delete(doc.fileUrl);
    }
    setDocuments((prev) => prev.filter((d) => d.id !== docId));
    handleCloseTab(`doc-${docId}`);
  };

  const handleOpenGraph = () => {
    graphCounter += 1;
    const id = `graph-${graphCounter}`;
    setTabs((prev) => [...prev, { id, kind: "graph", title: `Graph ${graphCounter}` }]);
    setActiveTabId(id);
  };

  const handleCloseTab = (tabId: string) => {
    setTabs((prev) => {
      const next = prev.filter((t) => t.id !== tabId);
      if (activeTabId === tabId) {
        setActiveTabId(next.at(-1)?.id ?? null);
      }
      return next;
    });
  };

  const activeTab = tabs.find((t) => t.id === activeTabId) ?? null;
  const activeDoc =
    activeTab?.kind === "document"
      ? documents.find((d) => d.id === activeTab.docId)
      : undefined;

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-gray-2 px-4">
        <Link
          to={ROUTES.COMMON_UI_EXAMPLES}
          className="flex items-center gap-1.5 text-typography-secondary hover:text-typography-primary"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <Text variant="label">Document Analyser</Text>
      </header>

      <div className="flex min-h-0 flex-1">
        <ChatPanel
          seedDocId={SEED_DOC_ID}
          activeQuote={activeQuote}
          onReference={handleReference}
          onOpenGraph={handleOpenGraph}
        />

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <TabStrip
            tabs={tabs}
            activeTabId={activeTabId}
            onSelect={setActiveTabId}
            onClose={handleCloseTab}
            onNewGraph={handleOpenGraph}
          />

          <div className="flex min-h-0 flex-1">
            {activeTab?.kind === "document" && activeDoc && (
              <PdfHighlightViewer
                key={activeDoc.id}
                file={activeDoc.fileUrl}
                quotes={activeDoc.quotes}
                activeQuote={activeQuote ?? undefined}
              />
            )}
            {activeTab?.kind === "graph" && <GraphTab />}
            {!activeTab && (
              <div className="grid flex-1 place-items-center">
                <Text variant="caption" color="secondary">
                  Open a document or graph to get started.
                </Text>
              </div>
            )}
          </div>
        </div>

        <UploadPanel
          documents={documents}
          activeDocId={activeDoc?.id}
          onUpload={handleUpload}
          onOpen={(doc) => openDocumentTab(doc)}
          onRemove={handleRemoveDocument}
        />
      </div>
    </div>
  );
}
