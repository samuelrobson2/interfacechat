import { DatasetInfoEditableItem } from "@/services/dataset";
import { useControlBrandContext } from "../model/control-brand-store";
import {
  ControlBrandSettingLayout,
  ControlBrandSettingTitle,
} from "../ui/control-brand-setting-layout";
import { Separator } from "@/shared/ui/kit/separator";
import blueprintImage from "@/shared/assets/images/blueprint.png";

export function ControlBrandGeneratedPrompt({
  separator,
  maxTextLines = 4,
}: {
  separator?: "top" | "bottom";
  maxTextLines?: number;
}) {
  const brand_custom_settings = useControlBrandContext(
    (state) => state.brand_custom_settings,
  );
  const setBrandSettings = useControlBrandContext(
    (state) => state.setBrandSettings,
  );

  if (!brand_custom_settings) return null;

  return (
    <>
      {separator === "top" && <Separator />}

      <ControlBrandSettingLayout className="flex-row gap-6.5">
        <img className="size-22.5" src={blueprintImage} alt="Blueprint image" />

        <div className="flex flex-col gap-4 w-full">
          <ControlBrandSettingTitle title="Your Blueprint" />

          <DatasetInfoEditableItem
            key={brand_custom_settings}
            value={brand_custom_settings}
            onSubmit={(value) => setBrandSettings(value)}
            maxTextLines={maxTextLines}
            inputType="textarea"
            name="brand_custom_settings"
            label="Your Blueprint"
          />
        </div>
      </ControlBrandSettingLayout>

      {separator === "bottom" && <Separator />}
    </>
  );
}
