import { useLoaderData } from "react-router-dom";
import { AuthContent, AuthHeader, AuthLayout } from "../_ui/auth-layout";
import { phoneOTPLoader } from "./model/phone-otp-loader";
import { PhoneOTPForm } from "./ui/phone-otp-form";

function PhoneOTPPage() {
  const phone = useLoaderData<typeof phoneOTPLoader>();

  return (
    <AuthLayout>
      <AuthHeader
        title="Verification code"
        subtitle={
          <>
            We just sent a code to <b>{phone}</b>.<br />
            Enter it below to continue
          </>
        }
      />
      <AuthContent>
        <PhoneOTPForm phone={phone} />
      </AuthContent>
    </AuthLayout>
  );
}

export const Component = PhoneOTPPage;
