import type { WinRateBar } from "../../model/metrics-types";

export type WinRateBarShapeProps = {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  fill?: string;
  payload?: WinRateBar;
};

export function WinRateBarShape({
  x,
  y,
  width,
  height,
  fill,
  payload,
}: WinRateBarShapeProps) {
  if (
    x === undefined ||
    y === undefined ||
    width === undefined ||
    height === undefined
  ) {
    return null;
  }

  const borderColor = payload?.borderColor;
  const borderWidth = 0.5;
  const halfStroke = borderWidth / 2;

  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={fill} />
      {borderColor ? (
        <>
          <line
            x1={x + halfStroke}
            y1={y + halfStroke}
            x2={x + width - halfStroke}
            y2={y + halfStroke}
            stroke={borderColor}
            strokeWidth={borderWidth}
          />
          <line
            x1={x + halfStroke}
            y1={y + halfStroke}
            x2={x + halfStroke}
            y2={y + height}
            stroke={borderColor}
            strokeWidth={borderWidth}
          />
          <line
            x1={x + width - halfStroke}
            y1={y + halfStroke}
            x2={x + width - halfStroke}
            y2={y + height}
            stroke={borderColor}
            strokeWidth={borderWidth}
          />
        </>
      ) : null}
    </g>
  );
}
