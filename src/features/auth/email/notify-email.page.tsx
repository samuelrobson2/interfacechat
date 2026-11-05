import { ArrowRightIcon } from "@/shared/assets/icons/outlined/ArrowRight";
import emailVerifiedImage from "@/shared/assets/images/signup-verify-open.png";
import { ROUTES } from "@/shared/model/routes";
import {
  InfoViewContent,
  InfoViewLayout,
  InfoViewTitle,
} from "@/shared/ui/info-view-layout";
import { Button } from "@/shared/ui/kit/button";
import { Link, useLoaderData } from "react-router-dom";
import { notifyEmailLoader } from "./model/notify-email-loader";

function NotifyEmailPage() {
  const email = useLoaderData<typeof notifyEmailLoader>();

  return (
    <InfoViewLayout>
      <img src={emailVerifiedImage} alt="Email" />

      <InfoViewContent>
        <InfoViewTitle
          title="Please verify your email"
          description={
            <>
              We’ve sent a verification link to{" "}
              <b className="text-typography-primary">{email}</b>.<br />
              Click the link in your inbox to continue.
            </>
          }
        />

        <Button asChild>
          <Link to={ROUTES.SIGNIN}>
            Go back <ArrowRightIcon pathClasses="stroke-current" />
          </Link>
        </Button>
      </InfoViewContent>
    </InfoViewLayout>
  );
}

export const Component = NotifyEmailPage;
