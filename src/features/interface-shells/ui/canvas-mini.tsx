import { cn } from "@/shared/lib/css";
import { svgUrl } from "../model/canvas-ai";
import { boardItems, boundsOf, heightOf } from "../model/canvas-layout";
import type { MoodboardItem, MoodboardShellData } from "../model/shell-types";
import { canvasColour, tint } from "./canvas-board";
import { FitBox } from "./shell-kit";

/** A few things scattered on a dotted board, for a canvas with nothing on it yet. */
const GHOST: MoodboardItem[] = [
  { id: "g1", kind: "image", x: 0, y: 40, w: 220, h: 260 },
  { id: "g2", kind: "note", x: 250, y: 0, w: 180, h: 110 },
  { id: "g3", kind: "drawing", x: 250, y: 140, w: 220, h: 160 },
  { id: "g4", kind: "colour", x: 500, y: 40, w: 90, h: 90 },
  { id: "g5", kind: "colour", x: 500, y: 150, w: 90, h: 90 },
];

const DOTS = {
  backgroundImage: "radial-gradient(circle at 1px 1px, rgba(26,23,24,0.12) 1px, transparent 0)",
  backgroundSize: "12px 12px",
};

/** One thing on the board at miniature scale: the real picture or colour, shapes standing in for words. */
function MiniItem({ item, ghost }: { item: MoodboardItem; ghost: boolean }) {
  const h = heightOf(item);
  const box = { left: item.x, top: item.y, width: item.w, height: h };
  if (ghost) {
    return (
      <span
        className={cn("absolute rounded-[18px]", item.kind === "note" ? "bg-orange-5/20" : item.kind === "colour" ? "bg-gray-3/30" : "bg-gray-3/15")}
        style={box}
      />
    );
  }
  switch (item.kind) {
    case "image":
      return item.src ? (
        <img src={item.src} alt="" draggable={false} className="absolute rounded-[18px] bg-gray-6 object-cover" style={box} />
      ) : (
        <span className="absolute rounded-[18px] bg-gray-6" style={box} />
      );
    case "drawing":
      return (
        <span className="absolute overflow-hidden rounded-[18px] bg-white p-3 shadow-[0_2px_8px_rgba(26,23,24,0.1)]" style={box}>
          {item.code && <img src={svgUrl(item.code)} alt="" draggable={false} className="size-full object-contain" />}
        </span>
      );
    case "component":
      // Shapes, not a live frame: a card with a heading line, two text lines and a button.
      return (
        <span className="absolute flex flex-col gap-4 rounded-[18px] bg-white p-6 shadow-[0_2px_8px_rgba(26,23,24,0.1)]" style={box}>
          <span className="h-5 w-1/2 rounded-full bg-gray-3/35" />
          <span className="h-3.5 w-5/6 rounded-full bg-gray-3/20" />
          <span className="h-3.5 w-2/3 rounded-full bg-gray-3/20" />
          <span className="mt-auto h-10 w-2/5 rounded-full bg-gray-5/80" />
        </span>
      );
    case "note":
      return (
        <span
          className="absolute flex flex-col gap-3 rounded-[16px] p-5"
          style={{ ...box, backgroundColor: tint(canvasColour(item.tone ?? "orange-5"), 26) }}
        >
          <span className="h-3.5 w-11/12 rounded-full bg-gray-5/25" />
          <span className="h-3.5 w-3/5 rounded-full bg-gray-5/25" />
        </span>
      );
    case "colour":
      return <span className="absolute rounded-[16px] ring-1 ring-black/5" style={{ ...box, height: item.w, backgroundColor: item.colour }} />;
  }
}

/**
 * The canvas in miniature, laid out as it is at large, for the medium card,
 * medium plus and inline. An empty canvas shows a few ghost shapes.
 */
export function CanvasMini({ data, className }: { data: MoodboardShellData; className?: string }) {
  const items = boardItems(data);
  const ghost = items.length === 0;
  const shown = ghost ? GHOST : items;
  const bounds = boundsOf(shown);
  const pad = 40;
  return (
    <div className={cn("relative overflow-hidden rounded-[10px] bg-gray-1", className)} style={DOTS}>
      <FitBox width={bounds.w + pad * 2} height={bounds.h + pad * 2} className="size-full">
        <div className="relative" style={{ width: bounds.w + pad * 2, height: bounds.h + pad * 2 }}>
          {shown.map((item) => (
            <MiniItem key={item.id} item={{ ...item, x: item.x - bounds.x + pad, y: item.y - bounds.y + pad }} ghost={ghost} />
          ))}
        </div>
      </FitBox>
    </div>
  );
}
