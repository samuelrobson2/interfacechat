import { Button } from "@/shared/ui/kit/button";
import { useState } from "react";
import {
  AuthAlternativeLogin,
  AuthBackButton,
  AuthCard,
  AuthContent,
  AuthHeader,
  AuthLayout,
  AuthLinks,
  AuthOrDivider,
} from "../_ui/auth-layout";
import { AuthGradientBackground } from "../_ui/auth-gradient-background";
import { useAuthGradient } from "../_ui/use-auth-gradient";
import { SignInForm } from "./ui/sign-in-form";
import { SignUpForm } from "./ui/sign-up-form";

function SignInPage() {
  const [isSignup, setIsSignup] = useState(false);
  const { phase, playExit } = useAuthGradient();

  const titleText = isSignup ? "Create your account" : "Let's start adapting";
  const footerText = isSignup
    ? "Already have an account?"
    : "Don't have an account?";
  const buttonText = isSignup ? "Sign in" : "Sign up";

  return (
    <>
      <AuthGradientBackground phase={phase} />
      <AuthLayout className="relative z-10">
        <AuthBackButton />
        <AuthCard>
          <AuthHeader title={titleText} useLogoIcon />
          <AuthContent className="p-0">
            {isSignup ? (
              <SignUpForm />
            ) : (
              <SignInForm onLoginSuccess={playExit} />
            )}
            <AuthOrDivider />
            <AuthAlternativeLogin />
            <AuthLinks
              footerText={footerText}
              actionButton={
                <Button
                  className="underline"
                  variant="link"
                  onClick={() => setIsSignup(!isSignup)}
                >
                  {buttonText}
                </Button>
              }
            />
          </AuthContent>
        </AuthCard>
      </AuthLayout>
    </>
  );
}

export const Component = SignInPage;
