import { useUpdateProfile } from "@/services/auth";
import { AuthContent, AuthHeader, AuthLayout } from "../_ui/auth-layout";
import { useSetupProfile } from "./model/use-setup-profile";
import { SetupCountriesForm } from "./ui/setup-countries-form";
import { SetupLanguagesForm } from "./ui/setup-languages-form";
import { SetupUserNameForm } from "./ui/setup-user-name-form";
import { SetupWelcomeScreen } from "./ui/setup-welcome-screen";
import { SetupDomainsForm } from "./ui/setup-domains-form";

function SetupProfilePage() {
  const { updateProfile, isPending, errorMessage } = useUpdateProfile();
  const { currentSetupState } = useSetupProfile();

  if (currentSetupState === "welcome") return <SetupWelcomeScreen />;

  const setupMap = {
    name: {
      title: "What would you like to be called?",
      form: SetupUserNameForm,
    },
    languages: {
      title: "What languages do you speak?",
      form: SetupLanguagesForm,
    },
    countries: {
      title: "Where are you located?",
      form: SetupCountriesForm,
    },
    domains: {
      title: "How would you like AI to adapt to you?",
      form: SetupDomainsForm,
    },
  };

  const currentSetupTitle = setupMap[currentSetupState].title;
  const CurrentSetupForm = setupMap[currentSetupState].form;

  return (
    <AuthLayout className="justify-center">
      <AuthHeader className="max-w-[426px]" title={currentSetupTitle} />
      <AuthContent className="gap-8">
        <CurrentSetupForm
          onSubmit={(data) => updateProfile(data)}
          isLoading={isPending}
          errorMessage={errorMessage}
        />
      </AuthContent>
    </AuthLayout>
  );
}

export const Component = SetupProfilePage;
