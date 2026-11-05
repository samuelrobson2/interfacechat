import { Skeleton } from "@/shared/ui/kit/skeleton";

type SkeletonCellsProps = {
  /** Number of placeholder cells to render inside the shared grid. */
  count?: number;
};

// Folder dashboard placeholders: folder art + label, one card per grid cell.
// Rendered as bare grid children so the parent grid keeps the static lead tile.
export function ChatFolderDashboardSkeletonCells({
  count = 7,
}: SkeletonCellsProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex w-full flex-col items-center gap-3">
          <Skeleton className="aspect-153/129 w-full rounded-[12px]" />
          <Skeleton className="h-[17px] w-20" />
        </div>
      ))}
    </>
  );
}

// Chat/session results placeholders: a single rounded card per grid cell.
export function ChatSessionSkeletonCells({ count = 8 }: SkeletonCellsProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton key={index} className="h-[100px] w-full rounded-[16px]" />
      ))}
    </>
  );
}

// Visualization placeholders: same card shape as chats, one per grid cell.
export function VisualizationSkeletonCells({ count = 8 }: SkeletonCellsProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton key={index} className="h-[130px] w-full rounded-[16px]" />
      ))}
    </>
  );
}

// Saved interface placeholders: square frame + label, one card per grid cell.
export function ChatInterfaceSkeletonCells({ count = 7 }: SkeletonCellsProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex w-full flex-col items-center gap-3">
          {/* Match InterfaceCard: horizontal padding keeps the frame size while
              the grid cell stays wider for the full-width title. */}
          <div className="w-full px-3 md:px-4">
            <Skeleton className="aspect-square w-full rounded-[16px]" />
          </div>
          <Skeleton className="h-[17px] w-20" />
        </div>
      ))}
    </>
  );
}
