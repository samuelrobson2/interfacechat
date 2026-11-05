import { ArrowRightIcon } from "@/shared/assets/icons/outlined/ArrowRight";
import { Button } from "@/shared/ui/kit/button";
import { Link } from "react-router-dom";
import passwordUpdatedImage from "@/shared/assets/images/password-updated.png";
import { ROUTES } from "@/shared/model/routes";
import {
  InfoViewContent,
  InfoViewLayout,
  InfoViewTitle,
} from "@/shared/ui/info-view-layout";

export function CreateNewPasswordSuccessPage() {
  return (
    <InfoViewLayout>
      <img src={passwordUpdatedImage} alt="Password updated" />

      <InfoViewContent>
        <InfoViewTitle
          title="Password updated"
          description={
            <>
              Your password has been successfully changed.
              <br />
              You can now sign in with your new credentials.
            </>
          }
        />

        <Button asChild>
          <Link to={ROUTES.SIGNIN}>
            Sign in <ArrowRightIcon pathClasses="stroke-current" />
          </Link>
        </Button>
      </InfoViewContent>
    </InfoViewLayout>
  );
}

export const Component = CreateNewPasswordSuccessPage;
