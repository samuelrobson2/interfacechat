import {
  ChildPageBackLink,
  ChildPageHeader,
  ChildPageLayout,
  ChildPageTitle,
} from "@/shared/ui/child-page-layout";
import { ProfileAvatar } from "./user-profile/compose/profile-avatar";
import { ProfileForm } from "./user-profile/compose/profile-form";
import { ProfileBadges } from "./user-profile/compose/profile-badges";

function UserProfilePage() {
  return (
    <ChildPageLayout className="gap-12">
      <ChildPageHeader>
        <ChildPageBackLink />
        <ChildPageTitle>Profile</ChildPageTitle>
      </ChildPageHeader>

      <div className="flex gap-8 items-start w-full min-w-0 overflow-y-auto no-scrollbar">
        <ProfileAvatar />

        <div className="flex-1 flex flex-col gap-12 w-full min-w-0 pb-12.5">
          <ProfileForm />
          <ProfileBadges />
        </div>
      </div>
    </ChildPageLayout>
  );
}

export const Component = UserProfilePage;
