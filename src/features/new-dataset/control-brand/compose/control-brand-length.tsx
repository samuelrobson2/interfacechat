import { TextConciseIcon } from "@/shared/assets/icons/size/TextConcise";
import { TextDetailedIcon } from "@/shared/assets/icons/size/TextDetailed";
import { TextExtensiveIcon } from "@/shared/assets/icons/size/TextExtensive";
import { TextMinimalIcon } from "@/shared/assets/icons/size/TextMinimal";
import brandLengthImage from "@/shared/assets/images/brand-length.png";
import { InteractiveBadge } from "@/shared/ui/kit/interactive-badge";
import { Text } from "@/shared/ui/kit/text";
import { useControlBrandContext } from "../model/control-brand-store";
import { useControlBrandParsedValues } from "../model/use-control-brand-parsed-values";
import {
  ControlBrandSettingLayout,
  ControlBrandSettingTitle,
} from "../ui/control-brand-setting-layout";
import { cn } from "@/shared/lib/css";

const LENGTH_ICONS_MAP = {
  brand_length_minimal: TextMinimalIcon,
  brand_length_concise: TextConciseIcon,
  brand_length_detailed: TextDetailedIcon,
  brand_length_extensive: TextExtensiveIcon,
};

export function ControlBrandLength({
  className,
}: React.ComponentProps<typeof ControlBrandSettingLayout>) {
  const { fields, lengthOptions, completionLength } =
    useControlBrandParsedValues();
  const brand_length = useControlBrandContext((state) => state.brand_length);
  const setBrandLength = useControlBrandContext(
    (state) => state.setBrandLength,
  );

  return (
    <ControlBrandSettingLayout className={cn("items-center", className)}>
      <img className="size-22.5" src={brandLengthImage} alt="Brand length" />

      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <ControlBrandSettingTitle
            title={fields?.brand_length?.title}
            tooltipContent="This controls the length of the completion."
          />

          {!!completionLength && (
            <div className="flex flex-col">
              <Text variant="label" color="secondary">
                Your current length
              </Text>
              <Text>{Number(completionLength).toFixed(1)} words</Text>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {lengthOptions?.map((option) => {
            const Icon =
              LENGTH_ICONS_MAP[option.key as keyof typeof LENGTH_ICONS_MAP];

            return (
              <InteractiveBadge
                key={option.key}
                className="bg-background-primary"
                isSelected={brand_length === option.value}
                onClick={() =>
                  setBrandLength(
                    brand_length === option.value ? "" : option.value,
                  )
                }
              >
                <Icon pathClasses="fill-current" />
                {option.title}
              </InteractiveBadge>
            );
          })}
        </div>
      </div>
    </ControlBrandSettingLayout>
  );
}
