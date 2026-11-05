import { ROUTES } from "@/shared/model/routes";
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { WelcomeOverlay } from "./ui/welcome-overlay";

const WELCOME_SCREEN_MS = 2000;

function WelcomePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const targetPath = searchParams.get("to");
  const returnTo =
    targetPath && targetPath.startsWith("/") && targetPath !== ROUTES.WELCOME
      ? targetPath
      : ROUTES.HOME;

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      navigate(returnTo, { replace: true });
    }, WELCOME_SCREEN_MS);

    return () => window.clearTimeout(timeout);
  }, [navigate, returnTo]);

  return <WelcomeOverlay />;
}

export const Component = WelcomePage;
