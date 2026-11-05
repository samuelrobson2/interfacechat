import brandSafetyImage from "@/shared/assets/images/brand-safety.png";
import { InteractiveBadge } from "@/shared/ui/kit/interactive-badge";
import { useControlBrandContext } from "../model/control-brand-store";
import { useControlBrandParsedValues } from "../model/use-control-brand-parsed-values";
import {
  ControlBrandSettingLayout,
  ControlBrandSettingTitle,
} from "../ui/control-brand-setting-layout";
import { cn } from "@/shared/lib/css";

export function ControlBrandSafety({
  className,
}: React.ComponentProps<typeof ControlBrandSettingLayout>) {
  const { fields, safetyOptions } = useControlBrandParsedValues();

  const brand_safety = useControlBrandContext((state) => state.brand_safety);
  const addBrandSafety = useControlBrandContext(
    (state) => state.addBrandSafety,
  );
  const removeBrandSafety = useControlBrandContext(
    (state) => state.removeBrandSafety,
  );

  const handleSafetyToggle = (safety: string) => {
    if (brand_safety.has(safety)) {
      removeBrandSafety(safety);
    } else {
      addBrandSafety(safety);
    }
  };

  return (
    <ControlBrandSettingLayout className={cn("items-center", className)}>
      <img className="size-22.5" src={brandSafetyImage} alt="Brand safety" />

      <div className="flex flex-col gap-6">
        <ControlBrandSettingTitle
          className="h-11"
          title={fields?.brand_safety?.title}
          tooltipContent="Outputs classification of what data points pose safety issues."
        />

        <div className="flex flex-wrap gap-3 items-start">
          {safetyOptions?.map((option) => (
            <InteractiveBadge
              key={option.value}
              className="bg-background-primary"
              isSelected={brand_safety.has(option.value)}
              onClick={() => handleSafetyToggle(option.value)}
            >
              {option.title}
            </InteractiveBadge>
          ))}
        </div>
      </div>
    </ControlBrandSettingLayout>
  );
}
