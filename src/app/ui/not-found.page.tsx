import { ArrowRightIcon } from "@/shared/assets/icons/outlined/ArrowRight";
import pageNotFoundImage from "@/shared/assets/images/page-not-found.png";
import { ROUTES } from "@/shared/model/routes";
import {
  InfoViewContent,
  InfoViewLayout,
  InfoViewTitle,
} from "@/shared/ui/info-view-layout";
import { Button } from "@/shared/ui/kit/button";
import { Link } from "react-router-dom";

export function AppNotFound({
  title,
  description,
  link,
}: {
  title: string;
  description?: string;
  link: string;
}) {
  return (
    <InfoViewLayout>
      <img src={pageNotFoundImage} alt="Page not found" />

      <InfoViewContent>
        <InfoViewTitle title={title} description={description} />

        <Button variant="primary" size="56" asChild>
          <Link to={link}>
            Go back{" "}
            <ArrowRightIcon pathClasses="dark-region stroke-icon-primary" />
          </Link>
        </Button>
      </InfoViewContent>
    </InfoViewLayout>
  );
}

function NotFoundPage() {
  return (
    <AppNotFound
      title="Oops! Page not found"
      description="We couldn't find the page you're looking for. It might have been moved or doesn't exist anymore."
      link={ROUTES.HOME}
    />
  );
}

export const Component = NotFoundPage;
