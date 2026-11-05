import * as React from "react";

import { cn } from "@/shared/lib/css";
import { Checkbox } from "../checkbox";

type ChecklistProps<T> = {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  values?: boolean[];
  onValuesChange?: (values: boolean[]) => void;
  className?: string;
};

const Checklist = <T,>({
  items,
  renderItem,
  values,
  onValuesChange,
  className,
}: ChecklistProps<T>) => {
  const [internalValues, setInternalValues] = React.useState<boolean[]>(
    () => values ?? items.map(() => false),
  );

  const resolvedValues = values ?? internalValues;

  const handleCheckedChange = (index: number, checked: boolean) => {
    const next = [...resolvedValues];
    next[index] = checked;

    if (onValuesChange) {
      onValuesChange(next);
    } else {
      setInternalValues(next);
    }
  };

  if (items.length === 0) return null;

  return (
    <div
      data-slot="checklist"
      className={cn("flex flex-col gap-4", className)}
      role="group"
    >
      {items.map((item, index) => (
        <label key={index} className="flex cursor-pointer items-center gap-2">
          <Checkbox
            checked={resolvedValues[index] ?? false}
            onCheckedChange={(checked) =>
              handleCheckedChange(index, checked === true)
            }
          />
          {renderItem(item, index)}
        </label>
      ))}
    </div>
  );
};

export { Checklist };
export type { ChecklistProps };
