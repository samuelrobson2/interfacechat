import { useLoaderData } from "react-router-dom";
import { PasswordForm } from "../_compose/password-form";
import {
  AuthBackButton,
  AuthCard,
  AuthContent,
  AuthHeader,
  AuthLayout,
} from "../_ui/auth-layout";
import { AuthGradientBackground } from "../_ui/auth-gradient-background";
import { useAuthGradient } from "../_ui/use-auth-gradient";
import { signUpPasswordLoader } from "./model/signup-password-loader";
import { useSignup } from "./model/use-signup";
import { Link } from "react-router-dom";
import { Button } from "@/shared/ui/kit/button";

function SignUpPasswordPage() {
  const email = useLoaderData<typeof signUpPasswordLoader>();
  const { phase, playExit } = useAuthGradient({ animateIn: false });
  const { signUp, isPending, errorMessage, errorLink } = useSignup({
    onSuccess: playExit,
  });

  const errorMessageWithLink = errorLink ? (
    <>
      {errorMessage?.toString()}{" "}
      <Button variant="link" className="underline" asChild>
        <Link to={errorLink}>Request beta access</Link>
      </Button>
    </>
  ) : (
    errorMessage?.toString()
  );

  return (
    <>
      <AuthGradientBackground phase={phase} />
      <AuthLayout className="relative z-10">
        <AuthBackButton />
        <AuthCard>
          <AuthHeader title="Create your account" useLockIcon />
          <AuthContent className="p-0">
            <PasswordForm
              onSubmit={(data) => signUp({ email, password: data.password })}
              isPending={isPending}
              errorMessage={errorMessageWithLink}
            />
          </AuthContent>
        </AuthCard>
      </AuthLayout>
    </>
  );
}

export const Component = SignUpPasswordPage;
