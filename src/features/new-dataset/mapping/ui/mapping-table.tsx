import { cn } from "@/shared/lib/css";
import { Badge } from "@/shared/ui/kit/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/kit/table";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { useMappingContext } from "../model/mapping-store";
import { getImageSrc } from "../lib/get-image-src";
import { type SelectedColumns } from "../model/use-mapping-table";
import { UNIVERSAL_PROMPT_COLUMN_ID } from "../model/use-mapping-table";

const HOVER_COLOR = "var(--mapping-hover-border)";
const SHADOW_SIDES = `inset 2px 0 0 ${HOVER_COLOR}, inset -2px 0 0 ${HOVER_COLOR}`;
const SHADOW_TOP = `inset 0 2px 0 ${HOVER_COLOR}`;
const SHADOW_BOTTOM = `inset 0 -2px 0 ${HOVER_COLOR}`;

function MappingImageCell({
  value,
  alt,
  fallback,
}: {
  value: unknown;
  alt: string;
  fallback: React.ReactNode;
}) {
  const [imageSrc, setImageSrc] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    void getImageSrc(value).then((src) => {
      if (!isActive) return;
      setImageSrc(src);
      setIsLoading(false);
    });

    return () => {
      isActive = false;
    };
  }, [value]);

  if (imageSrc) {
    return (
      <div className="flex items-start">
        <img
          src={imageSrc}
          alt={alt}
          className="block w-auto h-auto max-w-full max-h-[22.5rem] object-contain"
        />
      </div>
    );
  }

  if (isLoading) return null;
  return <>{fallback}</>;
}

export function MappingTable<TData, TValue>({
  columns,
  data,
  selectedColumns,
  imageColumnId,
  className,
  borderHoverColor,
  onColumnSelect,
  onColumnRemove,
  ...props
}: React.ComponentProps<typeof Table> & {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  selectedColumns?: SelectedColumns;
  imageColumnId?: string;
  borderHoverColor?: string;
  onColumnSelect?: (column: string) => void;
  onColumnRemove?: (column: string) => void;
}) {
  const [hoveredColumn, setHoveredColumn] = useState<string | null>(null);
  const universalPromptText = useMappingContext(
    (s) => s.prompt.universalPrompt,
  );
  const setUniversalPrompt = useMappingContext(
    (s) => s.prompt.setUniversalPrompt,
  );
  const setShowUniversalPrompt = useMappingContext(
    (s) => s.prompt.setShowUniversalPrompt,
  );
  const selectedColumn = useMappingContext((s) => s.selectedColumn);
  const setSelectedColumn = useMappingContext((s) => s.setSelectedColumn);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const colCount = table.getAllColumns().length;

  return (
    <div
      className={cn("overflow-hidden flex flex-col", className)}
      style={{ "--mapping-hover-border": borderHoverColor } as React.CSSProperties}
    >
      <Table
        wrapperClassName="flex-1 min-h-0"
        className="table-fixed w-full border-separate border-spacing-0"
        style={{ minWidth: `${colCount * 180}px` }}
        {...props}
      >
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const isHovered = hoveredColumn === header.id;
                const { value, bgColor } = selectedColumns?.[header.id] || {};
                const isUniversalCol = header.id === UNIVERSAL_PROMPT_COLUMN_ID;

                const isHighlighted =
                  !isUniversalCol && isHovered && !!borderHoverColor;

                return (
                  <TableHead
                    key={header.id}
                    className={cn(
                      "border-b border-b-gray-2 text-typography-secondary font-normal box-border",
                      !isUniversalCol && "cursor-pointer",
                      isHighlighted && "bg-background-primary rounded-t",
                    )}
                    style={
                      isHighlighted
                        ? { boxShadow: `${SHADOW_SIDES}, ${SHADOW_TOP}` }
                        : undefined
                    }
                    onMouseEnter={() => setHoveredColumn(header.id)}
                    onMouseLeave={() => setHoveredColumn(null)}
                    onClick={() =>
                      !isUniversalCol && onColumnSelect?.(header.id)
                    }
                  >
                    <span className="mr-4">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                    </span>
                    {value && (
                      <Badge
                        className={bgColor}
                        size="md"
                        closable
                        onClose={() => {
                          if (isUniversalCol) {
                            setUniversalPrompt("");
                            setShowUniversalPrompt(false);
                            if (selectedColumn === "prompt") {
                              setSelectedColumn(undefined);
                            }
                            return;
                          }
                          onColumnRemove?.(header.id);
                        }}
                      >
                        {value}
                      </Badge>
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row, index) => (
            <TableRow key={row.id}>
              {row.getAllCells().map((cell) => {
                const isHovered = hoveredColumn === cell.column.id;
                const isLast = index === table.getRowModel().rows.length - 1;
                const isUniversalCol =
                  cell.column.id === UNIVERSAL_PROMPT_COLUMN_ID;
                const isImageCol =
                  !!imageColumnId && cell.column.id === imageColumnId;
                const isHighlighted =
                  !isUniversalCol && isHovered && !!borderHoverColor;

                return (
                  <TableCell
                    key={cell.id}
                    className={cn(
                      "py-2 border-b border-gray-2 box-border",
                      isHighlighted &&
                        cn("bg-background-primary", isLast && "rounded-b border-b-transparent"),
                    )}
                    style={
                      isHighlighted
                        ? {
                            boxShadow: isLast
                              ? `${SHADOW_SIDES}, ${SHADOW_BOTTOM}`
                              : SHADOW_SIDES,
                          }
                        : undefined
                    }
                    onMouseEnter={() => setHoveredColumn(cell.column.id)}
                    onMouseLeave={() => setHoveredColumn(null)}
                  >
                    {isUniversalCol ? (
                      <div className="max-h-[22.5rem] overflow-y-auto overflow-x-hidden whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
                        {universalPromptText}
                      </div>
                    ) : isImageCol ? (
                      <MappingImageCell
                        key={`${cell.id}-${String(cell.getValue())}`}
                        value={cell.getValue()}
                        alt={cell.column.id}
                        fallback={flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      />
                    ) : (
                      <div className="line-clamp-15">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </div>
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
