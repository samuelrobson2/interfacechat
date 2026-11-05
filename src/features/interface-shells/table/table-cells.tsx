import { ImageIcon, Tag, Type } from "lucide-react";
import { useState } from "react";
import { cn } from "@/shared/lib/css";
import type { TableColumn, TableColumnType } from "../model/shell-types";

const TAG_TONES = [
  "bg-blue-1 text-blue-6",
  "bg-green-1 text-[#2f6e51]",
  "bg-orange-1 text-[#8a5a00]",
  "bg-rose-1 text-rose-3",
  "bg-[#e6f5f3] text-mint-3",
  "bg-yellow-1 text-[#6e5e00]",
];

export function tagTone(value: string) {
  let hash = 0;
  const key = value.trim().toLowerCase();
  for (let i = 0; i < key.length; i++) hash = (hash * 33 + key.charCodeAt(i)) | 0;
  return TAG_TONES[Math.abs(hash) % TAG_TONES.length];
}

export function TagChip({ value, compact }: { value: string; compact?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center truncate rounded-full font-bureau font-normal",
        compact ? "h-4 px-1.5 text-[10px]" : "h-6 px-2.5 text-[12px]",
        tagTone(value),
      )}
    >
      {value}
    </span>
  );
}

export function Thumbnail({
  url,
  className,
}: {
  url: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  if (!url || failed) {
    return (
      <span
        className={cn(
          "flex shrink-0 items-center justify-center bg-gray-6 text-typography-secondary",
          className,
        )}
      >
        <ImageIcon className="size-[40%] max-h-4 max-w-4" />
      </span>
    );
  }
  return (
    <img
      src={url}
      alt=""
      loading="lazy"
      onError={() => setFailed(true)}
      className={cn("shrink-0 bg-gray-6 object-cover", className)}
    />
  );
}

export const COLUMN_TYPE_ICON: Record<TableColumnType, typeof Type> = {
  text: Type,
  tag: Tag,
  image: ImageIcon,
};

export const COLUMN_TYPE_LABEL: Record<TableColumnType, string> = {
  text: "Text",
  tag: "Tag",
  image: "Image",
};

export const NEXT_COLUMN_TYPE: Record<TableColumnType, TableColumnType> = {
  text: "tag",
  tag: "image",
  image: "text",
};

/** Column width from its type and how long its content runs. */
export function columnWidth(column: TableColumn, values: string[]) {
  if (column.type === "image") return 104;
  const longest = Math.max(
    column.label.length,
    ...values.map((value) => value.length),
  );
  if (column.type === "tag") return Math.min(170, Math.max(112, longest * 8 + 40));
  const average =
    values.length > 0
      ? values.reduce((sum, value) => sum + value.length, 0) / values.length
      : column.label.length;
  return Math.round(Math.min(300, Math.max(104, average * 7.4 + 40)));
}
