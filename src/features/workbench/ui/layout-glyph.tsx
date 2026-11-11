import { cn } from "@/shared/lib/css";
import type { Rect, WorkspaceGeometry } from "../model/workbench-geometry";
import type { InstanceId } from "../model/workbench-layout";

const WIDTH = 20;
/** macOS proportions, whatever the window's: the diagram reads at this size. */
const HEIGHT = 14;
const STROKE = 1.2;
/** Space between the outline and the regions inside it. */
const INSET = 2.2;

/**
 * A small diagram of the workspace, in the style of macOS window tiling: a
 * rounded outline with this interface's region filled. Other regions are
 * barely there. It's generated from the same geometry the frames use, so it
 * shows size and position. Minimized shows a row of icons, one filled.
 */
export function LayoutGlyph({
  geometry,
  id,
  className,
}: {
  geometry: WorkspaceGeometry;
  id: InstanceId;
  className?: string;
}) {
  const { content } = geometry;
  if (!content.width || !content.height) return null;
  const height = HEIGHT;
  const inner = { x: INSET, y: INSET, width: WIDTH - INSET * 2, height: height - INSET * 2 };

  const scale = (rect: Rect) => {
    const x = inner.x + ((rect.x - content.x) / content.width) * inner.width;
    const y = inner.y + ((rect.y - content.y) / content.height) * inner.height;
    const w = (rect.width / content.width) * inner.width;
    const h = (rect.height / content.height) * inner.height;
    // A hairline gap between neighbours.
    return { x: x + 0.4, y: y + 0.4, width: Math.max(0.8, w - 0.8), height: Math.max(0.8, h - 0.8) };
  };

  const minimized = !geometry.frames[id];
  const dot = 2.4;
  const dotsX = WIDTH / 2 - (dot * 3 + 1.2 * 2) / 2;

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${height}`}
      width={WIDTH}
      height={height}
      className={cn("shrink-0 text-gray-3", className)}
      aria-hidden
    >
      <rect
        x={STROKE / 2}
        y={STROKE / 2}
        width={WIDTH - STROKE}
        height={height - STROKE}
        rx={3.4}
        fill="none"
        stroke="currentColor"
        strokeWidth={STROKE}
      />
      {minimized
        ? [0, 1, 2].map((index) => (
            <rect
              key={index}
              x={dotsX + index * (dot + 1.2)}
              y={height / 2 - dot / 2}
              width={dot}
              height={dot}
              rx={0.7}
              fill="currentColor"
              fillOpacity={index === 2 ? 1 : 0.22}
            />
          ))
        : Object.entries(geometry.frames).map(([frameId, rect]) => (
            <rect
              key={frameId}
              {...scale(rect)}
              rx={1.4}
              fill="currentColor"
              fillOpacity={frameId === id ? 1 : 0.12}
            />
          ))}
    </svg>
  );
}
