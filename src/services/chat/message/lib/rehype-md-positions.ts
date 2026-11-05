// Minimal local HAST shape — avoids a hard dependency on @types/hast while
// still providing strong typing for the bits we touch.
type HastPoint = { offset?: number };
type HastPosition = { start: HastPoint; end: HastPoint };
type HastNode = {
  type: string;
  tagName?: string;
  value?: string;
  position?: HastPosition;
  properties?: Record<string, unknown>;
  children?: HastNode[];
};

// Rehype plugin that annotates the HAST with position attributes so the DOM
// Selection API can be mapped back to exact offsets in the original markdown.
//
// Two things happen here:
// 1. Every element gets data-md-start / data-md-end (block-level anchors).
// 2. Every text node is wrapped into a <span data-md-start data-md-end> so
//    that per-character offsets inside Range can be resolved precisely.
export const rehypeMdPositions = () => (tree: HastNode) => {
  const getOffsets = (node: HastNode) => {
    if (!node.position) return undefined;
    const start = node.position.start.offset;
    const end = node.position.end.offset;
    if (typeof start !== "number" || typeof end !== "number") return undefined;
    return { start, end };
  };

  const visit = (node: HastNode) => {
    if (node.type === "element") {
      const offsets = getOffsets(node);
      if (offsets) {
        node.properties = node.properties ?? {};
        node.properties["data-md-start"] = String(offsets.start);
        node.properties["data-md-end"] = String(offsets.end);
      }
    }

    if (!node.children) return;

    // Rebuild children so that every positioned text node is wrapped in a
    // span carrying its offsets. The freshly created spans are NOT visited
    // again — otherwise they would wrap their own text child recursively.
    const nextChildren: HastNode[] = [];
    for (const child of node.children) {
      if (child.type === "text") {
        const offsets = getOffsets(child);
        if (offsets) {
          nextChildren.push({
            type: "element",
            tagName: "span",
            properties: {
              "data-md-start": String(offsets.start),
              "data-md-end": String(offsets.end),
            },
            children: [child],
            position: child.position,
          });
          continue;
        }
        nextChildren.push(child);
        continue;
      }

      visit(child);
      nextChildren.push(child);
    }

    node.children = nextChildren;
  };

  visit(tree);
};
