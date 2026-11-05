import { Skeleton } from "@/shared/ui/kit/skeleton";
import { Card } from "@/shared/ui/kit/card";

function QuestionnaireItemSkeleton() {
  return (
    <Card className="flex-1 min-w-0 gap-8 p-8">
      <Skeleton className="w-full h-[260px]" />

      <div className="flex flex-col gap-2">
        <Skeleton className="w-[200px] h-9" />
        <Skeleton className="w-full h-6" />
      </div>
    </Card>
  );
}

export function QuestionnaireSkeleton() {
  return (
    <div className="flex flex-col gap-15 items-center">
      <div className="flex flex-col gap-1.5 w-[380px] items-center h-24">
        <Skeleton className="w-full h-11" />
        <Skeleton className="w-[340px] h-11" />
      </div>

      <div className="flex gap-8 w-full max-w-[888px]">
        <QuestionnaireItemSkeleton />
        <QuestionnaireItemSkeleton />
      </div>
    </div>
  );
}
