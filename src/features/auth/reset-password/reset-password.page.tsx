import { AuthContent, AuthHeader, AuthLayout } from "../_ui/auth-layout";
import { ResetPasswordForm } from "./ui/reset-password-form";

function ResetPasswordPage() {
  return (
    <AuthLayout>
      <AuthHeader
        title="Reset password"
        subtitle="Enter your email address and we’ll send you a link to reset your password"
        useLockIcon
      />
      <AuthContent>
        <ResetPasswordForm />
      </AuthContent>
    </AuthLayout>
  );
}

export const Component = ResetPasswordPage;
