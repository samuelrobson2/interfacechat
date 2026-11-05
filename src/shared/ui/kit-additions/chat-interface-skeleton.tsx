import { cn } from "@/shared/lib/css";
import { Skeleton } from "@/shared/ui/kit/skeleton";

import { useInterfaceSkeleton } from "./use-interface-skeleton";

type SkeletonRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

type SkeletonBlock = {
  id: string;
  radius: number;
  steps: SkeletonRect[];
};

const SKELETON_BLOCKS: SkeletonBlock[] = [
  {
    id: "avatar",
    radius: 999,
    steps: [
      { left: 0, top: 0, width: 6, height: 7 },
      { left: 0, top: 0, width: 6, height: 7 },
      { left: 0, top: 0, width: 6, height: 7 },
    ],
  },
  {
    id: "line-1",
    radius: 4,
    steps: [
      { left: 8, top: 1, width: 20, height: 2.5 },
      { left: 8, top: 1, width: 30, height: 2.5 },
      { left: 8, top: 1, width: 25, height: 2.5 },
    ],
  },
  {
    id: "line-2",
    radius: 4,
    steps: [
      { left: 8, top: 4.5, width: 15, height: 2.5 },
      { left: 8, top: 4.5, width: 22, height: 2.5 },
      { left: 8, top: 4.5, width: 18, height: 2.5 },
    ],
  },
  {
    id: "side",
    radius: 16,
    steps: [
      { left: 0, top: 11, width: 30, height: 89 },
      { left: 0, top: 44, width: 48, height: 56 },
      { left: 68, top: 11, width: 32, height: 42 },
    ],
  },
  {
    id: "main",
    radius: 16,
    steps: [
      { left: 32, top: 0, width: 68, height: 56 },
      { left: 0, top: 11, width: 100, height: 30 },
      { left: 34, top: 11, width: 32, height: 89 },
    ],
  },
  {
    id: "card-1",
    radius: 16,
    steps: [
      { left: 32, top: 59, width: 21.3, height: 41 },
      { left: 51, top: 44, width: 49, height: 27 },
      { left: 0, top: 11, width: 32, height: 89 },
    ],
  },
  {
    id: "card-2",
    radius: 16,
    steps: [
      { left: 55.3, top: 59, width: 21.3, height: 41 },
      { left: 51, top: 73, width: 24, height: 27 },
      { left: 68, top: 56, width: 32, height: 20 },
    ],
  },
  {
    id: "card-3",
    radius: 16,
    steps: [
      { left: 78.6, top: 59, width: 21.4, height: 41 },
      { left: 76, top: 73, width: 24, height: 27 },
      { left: 68, top: 79, width: 32, height: 21 },
    ],
  },
];

const STEPS_COUNT = SKELETON_BLOCKS[0]?.steps.length ?? 0;

export function ChatInterfaceSkeleton({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const stepIndex = useInterfaceSkeleton(STEPS_COUNT);

  return (
    <div
      className={cn("relative size-full", className)}
      role="status"
      aria-busy="true"
      aria-label="Generating interface"
      {...props}
    >
      {SKELETON_BLOCKS.map((block, index) => {
        const rect = block.steps[stepIndex];
        if (!rect) return null;

        return (
          <Skeleton
            key={block.id}
            className="absolute transition-[left,top,width,height] duration-900 ease-in-out motion-reduce:transition-none"
            style={{
              left: `${rect.left}%`,
              top: `${rect.top}%`,
              width: `${rect.width}%`,
              height: `${rect.height}%`,
              borderRadius: `${block.radius}px`,
              transitionDelay: `${index * 60}ms`,
            }}
          />
        );
      })}

      <span className="sr-only">Generating interface…</span>
    </div>
  );
}
