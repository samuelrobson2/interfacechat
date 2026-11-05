import {
  PATTERN_GEOMETRY,
  type PatternRef,
  type PatternShape,
} from "../lib/numi-vega-patterns";

const shapeOf = (shape: PatternShape, color: string, key: number) => {
  if (shape.shape === "circle") {
    return (
      <circle key={key} cx={shape.cx} cy={shape.cy} r={shape.r} fill={color} />
    );
  }
  return (
    <line
      key={key}
      x1={shape.x1}
      y1={shape.y1}
      x2={shape.x2}
      y2={shape.y2}
      stroke={color}
      strokeWidth={shape.width}
    />
  );
};

/**
 * Paint servers for the pattern fills a chart refers to.
 */
export function VegaPatternDefs({ refs }: { refs: PatternRef[] }) {
  if (refs.length === 0) return null;

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width={0}
      height={0}
      className="pointer-events-none absolute"
    >
      <defs>
        {refs.map((ref) => {
          const tile = PATTERN_GEOMETRY[ref.kind];
          return (
            <pattern
              key={ref.id}
              id={ref.id}
              width={tile.size}
              height={tile.size}
              patternUnits="userSpaceOnUse"
              patternTransform={
                tile.rotate ? `rotate(${tile.rotate})` : undefined
              }
            >
              <rect
                width={tile.size}
                height={tile.size}
                fill={ref.color}
                fillOpacity={tile.opacity}
              />
              {tile.shapes.map((shape, index) =>
                shapeOf(shape, ref.color, index),
              )}
            </pattern>
          );
        })}
      </defs>
    </svg>
  );
}
