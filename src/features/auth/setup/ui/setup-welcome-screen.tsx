import betaProgramImage from "@/shared/assets/images/beta-program.png";
import {
  InfoViewContent,
  InfoViewLayout,
  InfoViewTitle,
} from "@/shared/ui/info-view-layout";
import { Button } from "@/shared/ui/kit/button";
import { Link } from "react-router-dom";
import { DISCORD_LINK, ROUTES } from "@/shared/model/routes";

export function SetupWelcomeScreen() {
  return (
    <InfoViewLayout>
      <img src={betaProgramImage} alt="Beta program" />

      <InfoViewContent>
        <InfoViewTitle
          title="Welcome to our Beta Program"
          descriptionClassName="max-w-[500px] text-balance"
          description={
            <>
              You're one of the first people to ever touch Adaptive Data. That's
              not a small thing. We're a few months in, moving fast, and
              building this with you. Every piece of feedback shapes what this
              becomes.
              <br />
              {"👾 "}Join{" "}
              <Link
                className="text-typography-primary underline"
                to={DISCORD_LINK}
                target="_blank"
              >
                Discord
              </Link>{" "}
              and help us adapt better.
            </>
          }
        />

        <Button asChild>
          <Link to={ROUTES.HOME}>Explore</Link>
        </Button>
      </InfoViewContent>
    </InfoViewLayout>
  );
}

export const Component = SetupWelcomeScreen;
