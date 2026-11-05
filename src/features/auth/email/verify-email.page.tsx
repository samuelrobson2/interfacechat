import { ArrowRightIcon } from "@/shared/assets/icons/outlined/ArrowRight";
import brokenChainImage from "@/shared/assets/images/broken-chain.png";
import signupVerifyImage from "@/shared/assets/images/signup-verify-closed.png";
import { ROUTES } from "@/shared/model/routes";
import { Button } from "@/shared/ui/kit/button";
import { Link, useLoaderData } from "react-router-dom";
import { verifyEmailloader } from "./model/verify-email-loader";
import { useLoginAfterVerify } from "./model/use-login-after-verify";
import {
  InfoViewContent,
  InfoViewLayout,
  InfoViewTitle,
} from "@/shared/ui/info-view-layout";

function VerifyEmailPage() {
  const data = useLoaderData<typeof verifyEmailloader>();
  const { loginUser, isVerified } = useLoginAfterVerify(data);

  const image = isVerified ? signupVerifyImage : brokenChainImage;
  const title = isVerified ? "All set!" : "Something went wrong";
  const text = isVerified
    ? "Your email is verified — you can now sign in"
    : "Your verification link may have expired. Try sending a new one";

  return (
    <InfoViewLayout>
      <img src={image} alt="Email" />

      <InfoViewContent>
        <InfoViewTitle title={title} description={text} />

        {isVerified ? (
          <Button onClick={loginUser}>Sign in</Button>
        ) : (
          <Button asChild>
            <Link to={ROUTES.SIGNIN}>
              Resend link{" "}
              <ArrowRightIcon pathClasses="dark-region stroke-icon-primary" />
            </Link>
          </Button>
        )}
      </InfoViewContent>
    </InfoViewLayout>
  );
}

export const Component = VerifyEmailPage;
