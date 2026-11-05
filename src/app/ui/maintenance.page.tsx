import pageNotFoundImage from "@/shared/assets/images/page-not-found.png";
import {
  InfoViewContent,
  InfoViewLayout,
  InfoViewTitle,
} from "@/shared/ui/info-view-layout";

function MaintenancePage() {
  return (
    <InfoViewLayout>
      <img src={pageNotFoundImage} alt="Maintenance in progress" />

      <InfoViewContent>
        <InfoViewTitle
          title="Maintenance in progress."
          description="The service is temporarily unavailable. Please check back again soon. Thank you for your patience."
        />
      </InfoViewContent>
    </InfoViewLayout>
  );
}

export const Component = MaintenancePage;
