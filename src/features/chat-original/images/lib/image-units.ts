import { cn } from "@/shared/lib/css";

export const PLANNED_UNITS = ["header", "checklist", "comparison", "cards"];
export type PlannedUnit = (typeof PLANNED_UNITS)[number];

// Visual treatment applied to images that are still generating.
export const pendingImageEffectClassName = cn(
  "!rounded-[16px] bg-gray-6",
  "shadow-[inset_-12px_-12px_20px_rgba(117,188,230,0.28),inset_12px_12px_20px_rgba(0,0,0,0.16)]",
);
