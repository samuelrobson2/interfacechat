import brokenChainImage from "@/shared/assets/images/broken-chain.png";
import { ROUTES } from "@/shared/model/routes";
import {
  InfoViewContent,
  InfoViewLayout,
  InfoViewTitle,
} from "@/shared/ui/info-view-layout";
import { Button } from "@/shared/ui/kit/button";
import { Link } from "react-router-dom";

export function CreateNewPasswordErrorPage() {
  return (
    <InfoViewLayout>
      <img src={brokenChainImage} alt="Broken chain" />

      <InfoViewContent>
        <InfoViewTitle
          title="Something went wrong"
          description="Your verification link may have expired. Try sending a new one"
        />

        <Button asChild>
          <Link to={ROUTES.RESET_PASSWORD}>Resend link</Link>
        </Button>
      </InfoViewContent>
    </InfoViewLayout>
  );
}

export const Component = CreateNewPasswordErrorPage;
