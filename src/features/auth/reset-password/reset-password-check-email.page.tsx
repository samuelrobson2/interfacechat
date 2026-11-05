import { ArrowRightIcon } from "@/shared/assets/icons/outlined/ArrowRight";
import emailVerifiedImage from "@/shared/assets/images/signup-verify-closed.png";
import { ROUTES } from "@/shared/model/routes";
import {
  InfoViewContent,
  InfoViewLayout,
  InfoViewTitle,
} from "@/shared/ui/info-view-layout";
import { Button } from "@/shared/ui/kit/button";
import { Link, useLoaderData } from "react-router-dom";
import { resetPasswordCheckEmailLoader } from "./model/reset-password-check-email-loader";

function ResetPasswordCheckEmailPage() {
  const email = useLoaderData<typeof resetPasswordCheckEmailLoader>();

  return (
    <InfoViewLayout>
      <img src={emailVerifiedImage} alt="Email" />

      <InfoViewContent>
        <InfoViewTitle
          title="Check your email"
          description={
            <>
              We’ve sent you a password reset link to{" "}
              <b className="text-typography-primary">{email}</b>.<br />
              Please follow the instructions in the email to continue.
            </>
          }
        />

        <Button asChild>
          <Link to={ROUTES.RESET_PASSWORD}>
            Go back <ArrowRightIcon pathClasses="stroke-current" />
          </Link>
        </Button>
      </InfoViewContent>
    </InfoViewLayout>
  );
}

export const Component = ResetPasswordCheckEmailPage;
