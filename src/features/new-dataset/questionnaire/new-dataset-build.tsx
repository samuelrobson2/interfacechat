import { AiStarIcon } from "@/shared/assets/icons/outlined/AiStar";
import adaptDataImage from "@/shared/assets/images/adapt-data.png";
import autoscienstistImage from "@/shared/assets/images/autoscientist.png";
import visualizeImage from "@/shared/assets/images/visualize.png";
import { isChatVisualizeEnabled } from "@/shared/model/feature-flag";
import { ROUTES } from "@/shared/model/routes";
import { Badge } from "@/shared/ui/kit/badge";
import { QuestionnaireItem } from "@/services/dataset";
import { cn } from "@/shared/lib/css";

export function NewDatsetBuild({
  className,
  // Where each card leads. Defaults to the real app flow; the Build workspace
  // overrides these to its studio-design example pages.
  adaptiveDataTo = ROUTES.NEW_DATASET_ADAPT,
  autoscientistTo = ROUTES.DATASET_AUTOSCIENTIST_DASHBOARD,
  visualizeTo = ROUTES.CHAT_VISUALIZE,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  adaptiveDataTo?: string;
  autoscientistTo?: string;
  visualizeTo?: string;
}) {
  const isVisualizeEnabled = isChatVisualizeEnabled();
  const cardClassName = isVisualizeEnabled
    ? "w-auto min-w-0 flex-1 [--hairline-radius:24px] rounded-[24px]"
    : "[--hairline-radius:24px] rounded-[24px]";

  return (
    <div
      className={cn(
        "flex justify-center gap-8 w-full",
        isVisualizeEnabled
          ? "items-stretch max-w-[1116px] [&_img]:h-53 [&_img]:max-w-full [&_img]:object-contain"
          : "items-center",
        "only:[&_a]:py-[40.5px] overflow-visible",
        className,
      )}
      {...props}
    >
      <QuestionnaireItem
        className={cardClassName}
        as="link"
        title="Adaptive Data"
        description={
          <>
            Adaption dynamically shapes data at scale to target new objectives
            and rapidly scale quality.
            <br />
            <br />
          </>
        }
        image={adaptDataImage}
        imageAlt="Adapt data"
        to={adaptiveDataTo}
      />

      <QuestionnaireItem
        className={cardClassName}
        as="link"
        title={
          <>
            AutoScientist{" "}
            <Badge className="gap-0 px-4" size="sm">
              BETA <AiStarIcon pathClasses="bg-gradient-black-blue" />
            </Badge>
          </>
        }
        description="Adaption deploys a self-learning scientist to dynamically and continuously train the best model for your task."
        image={autoscienstistImage}
        imageAlt="Invent data"
        to={autoscientistTo}
      />

      {isVisualizeEnabled && (
        <QuestionnaireItem
          className={cardClassName}
          as="link"
          title={
            <>
              Visualize{" "}
              <Badge className="gap-0 px-4" size="sm">
                BETA <AiStarIcon pathClasses="bg-gradient-black-blue" />
              </Badge>
            </>
          }
          description="Adaption turns your data into interactive charts through chat. Ready to adjust, compare and save your results to your dashboard."
          image={visualizeImage}
          imageAlt="Visualize"
          to={visualizeTo}
        />
      )}
    </div>
  );
}
