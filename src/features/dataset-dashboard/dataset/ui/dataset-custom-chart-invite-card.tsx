import { PlusSmallIcon } from "@/shared/assets/icons/outlined/PlusSmall";
import visualizeImage from "@/shared/assets/images/visualize.png";
import { cn } from "@/shared/lib/css";
import { visualizePath } from "@/shared/model/routes";
import { Button } from "@/shared/ui/kit/button";
import { Text } from "@/shared/ui/kit/text";
import { Link } from "react-router-dom";

export function DatasetCustomChartInviteCard({
  datasetId,
  className,
}: {
  datasetId?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-h-[384px] flex-col items-center justify-center gap-[32px] rounded-[24px] border-[0.5px] border-dashed border-stroke-tertiary bg-background-secondary p-14 text-center",
        className,
      )}
    >
      <div className="flex flex-col items-center gap-[16px]">
        <img
          src={visualizeImage}
          alt=""
          className="size-[90px] object-contain"
        />

        <div className="flex flex-col items-center gap-[12px]">
          <Text variant="title">Custom chart</Text>
          <Text color="secondary" className="text-balance">
            Adaption turns your data into interactive charts through chat
          </Text>
        </div>
      </div>

      <Button variant="dashboard" asChild>
        <Link to={visualizePath(datasetId)}>
          <PlusSmallIcon svgClasses="size-4" pathClasses="stroke-current" />
          Add custom chart
        </Link>
      </Button>
    </div>
  );
}
