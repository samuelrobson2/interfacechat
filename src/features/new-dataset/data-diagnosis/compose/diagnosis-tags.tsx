import { DatasetTagsCard, DatasetTagsCardContent } from "@/services/dataset";
import inclinedCirclesImage from "@/shared/assets/images/inclined-circles.png";
import globeImage from "@/shared/assets/images/globe.png";
import coneImage from "@/shared/assets/images/cone.png";
import { Badge } from "@/shared/ui/kit/badge";
import { useDiagnosisParsedValues } from "../model/use-diagnosis-parsed-values";
import { Separator } from "@/shared/ui/kit/separator";

export function DiagnosisTags() {
  const { fields, domains, languages, tones } = useDiagnosisParsedValues();

  return (
    <div className="flex gap-8">
      <DatasetTagsCard
        className="flex-1"
        title={fields?.domain?.title}
        icon={
          <img
            className="size-22.5 self-center"
            src={inclinedCirclesImage}
            alt="Domains"
          />
        }
      >
        <DatasetTagsCardContent>
          {domains.map((tag) => (
            <Badge key={tag}>{tag}</Badge>
          ))}
        </DatasetTagsCardContent>
      </DatasetTagsCard>

      <Separator orientation="vertical" color="secondary" />

      <DatasetTagsCard
        className="flex-1"
        title={fields?.language?.title}
        icon={
          <img
            className="size-22.5 self-center"
            src={globeImage}
            alt="Languages"
          />
        }
      >
        <DatasetTagsCardContent>
          {languages.map((tag) => (
            <Badge key={tag}>{tag}</Badge>
          ))}
        </DatasetTagsCardContent>
      </DatasetTagsCard>

      <Separator orientation="vertical" color="secondary" />

      <DatasetTagsCard
        className="flex-1"
        title={fields?.tone?.title}
        icon={
          <img className="size-22.5 self-center" src={coneImage} alt="Tones" />
        }
      >
        <DatasetTagsCardContent variant="wrap">
          {tones.map((tag) => (
            <Badge key={tag}>{tag}</Badge>
          ))}
        </DatasetTagsCardContent>
      </DatasetTagsCard>
    </div>
  );
}
