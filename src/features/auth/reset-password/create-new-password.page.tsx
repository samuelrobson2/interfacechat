import { useLoaderData } from "react-router-dom";
import { PasswordForm } from "../_compose/password-form";
import { AuthContent, AuthHeader, AuthLayout } from "../_ui/auth-layout";
import { createNewPasswordLoader } from "./model/create-new-password-loader";
import { useCreateNewPassword } from "./model/use-create-new-password";

function CreateNewPasswordPage() {
  const verificationToken = useLoaderData<typeof createNewPasswordLoader>();
  const { createNewPassword, isPending, errorMessage } = useCreateNewPassword();

  return (
    <AuthLayout>
      <AuthHeader title="Create new password" useLockIcon />
      <AuthContent>
        <PasswordForm
          onSubmit={(data) =>
            createNewPassword({ password: data.password }, verificationToken)
          }
          isPending={isPending}
          errorMessage={errorMessage?.toString()}
          submitLabel="Save password"
          showTermsAgreement={false}
        />
      </AuthContent>
    </AuthLayout>
  );
}

export const Component = CreateNewPasswordPage;
