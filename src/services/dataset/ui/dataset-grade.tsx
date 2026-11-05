import { cn } from "@/shared/lib/css";
import { Text } from "@/shared/ui/kit/text";

export type DatasetGrade = "A" | "B" | "C" | "D" | "E";

const mapGradeToTextColor: Record<DatasetGrade, string> = {
  A: "text-green-5",
  B: "text-yellow-5",
  C: "text-yellow-5",
  D: "text-orange-5",
  E: "text-red-5",
};

export function DatasetGrade({
  grade,
  className,
}: {
  grade: DatasetGrade;
  className?: string;
}) {
  return (
    <Text
      className={cn(
        "text-[100px] leading-[100%] tracking-[-0.02em] font-extralight",
        mapGradeToTextColor[grade],
        className,
      )}
    >
      {grade}
    </Text>
  );
}
