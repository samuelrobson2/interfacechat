import { AuthContent, AuthHeader, AuthLayout } from "../_ui/auth-layout";
import { PhoneAuthForm } from "./ui/phone-auth-form";

function PhoneAuthPage() {
  return (
    <AuthLayout>
      <AuthHeader title="Your phone number" />
      <AuthContent>
        <PhoneAuthForm />
      </AuthContent>
    </AuthLayout>
  );
}

export const Component = PhoneAuthPage;
