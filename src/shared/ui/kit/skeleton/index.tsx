import { cn } from "@/shared/lib/css"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-skeleton-primary animate-pulse rounded-[4px]", className)}
      {...props}
    />
  )
}

export { Skeleton }
