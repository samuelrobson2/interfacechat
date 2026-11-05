import {
  InfoViewContent,
  InfoViewLayout,
  InfoViewTitle,
} from "@/shared/ui/info-view-layout";
import dataProcessingImage from "@/shared/assets/images/data-processing.png";

export function DatasetNotReadyCard() {
  return (
    <InfoViewLayout className="mt-0">
      <img src={dataProcessingImage} alt="Data processing" />

      <InfoViewContent>
        <InfoViewTitle
          title="Data is being processed"
          description="Please wait while we process the data."
        />
      </InfoViewContent>
    </InfoViewLayout>
  );
}
