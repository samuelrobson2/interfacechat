import hallucinationMitigationImage from "@/shared/assets/images/hallucination-mitigation.png";
import { Text } from "@/shared/ui/kit/text";
import { useControlBrandParsedValues } from "../model/use-control-brand-parsed-values";
import {
  ControlBrandSettingLayout,
  ControlBrandSettingTitle,
} from "../ui/control-brand-setting-layout";
import { Switch } from "@/shared/ui/kit/switch";
import { useControlBrandContext } from "../model/control-brand-store";
import { cn } from "@/shared/lib/css";

export function ControlBrandHallucination({
  className,
  ...props
}: React.ComponentProps<typeof ControlBrandSettingLayout>) {
  const { fields } = useControlBrandParsedValues();
  const hallucination_mitigation = useControlBrandContext(
    (state) => state.hallucination_mitigation,
  );
  const setHallucinationMitigation = useControlBrandContext(
    (state) => state.setHallucinationMitigation,
  );

  return (
    <ControlBrandSettingLayout
      className={cn("flex-row gap-6.5 items-center", className)}
      {...props}
    >
      <img
        className="size-25"
        src={hallucinationMitigationImage}
        alt="Hallucination mitigation"
      />

      <div className="flex justify-between gap-2 w-full">
        <div className="flex flex-col gap-2">
          <ControlBrandSettingTitle
            title={fields?.hallucination_mitigation?.title}
            tooltipContent="Reduces hallucination across entire dataset."
          />
          <Text color="secondary">Reduces hallucinations</Text>
        </div>

        <Switch
          checked={hallucination_mitigation === "true"}
          onCheckedChange={(checked) =>
            setHallucinationMitigation(checked ? "true" : "false")
          }
        />
      </div>
    </ControlBrandSettingLayout>
  );
}
