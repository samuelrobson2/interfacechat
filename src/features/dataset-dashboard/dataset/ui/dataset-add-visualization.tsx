import { PlusSmallIcon } from "@/shared/assets/icons/outlined/PlusSmall";
import { cn } from "@/shared/lib/css";
import { visualizePath } from "@/shared/model/routes";
import { Button } from "@/shared/ui/kit/button";
import { Separator } from "@/shared/ui/kit/separator";
import { Link, useParams } from "react-router-dom";

export function DatasetAddVisualization({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { dataset_id } = useParams();

  return (
    <div className={cn("flex w-full items-center gap-4", className)} {...props}>
      <Separator
        color="secondary"
        className="flex-1 data-[orientation=horizontal]:h-[0.5px]"
      />

      <Button variant="dashboard" asChild>
        <Link to={visualizePath(dataset_id)}>
          <PlusSmallIcon svgClasses="size-4" pathClasses="stroke-current" />
          Add custom chart
        </Link>
      </Button>

      <Separator
        color="secondary"
        className="flex-1 data-[orientation=horizontal]:h-[0.5px]"
      />
    </div>
  );
}
