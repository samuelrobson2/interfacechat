import { useSessionStore } from "@/services/auth";
import { LockIcon } from "@/shared/assets/icons/general/Lock";
import { TrashIcon } from "@/shared/assets/icons/general/Trash";
import { ArrowRightIcon } from "@/shared/assets/icons/outlined/ArrowRight";
import { ROUTES } from "@/shared/model/routes";
import { Button } from "@/shared/ui/kit/button";
import { Separator } from "@/shared/ui/kit/separator";
import { Link } from "react-router-dom";
import { SettingsItem, SettingsItemHeader } from "../../_ui/settings-item";
import { useDeleteUser } from "../model/use-delete-user";
import { GeneralForm } from "../ui/general-form";
import { SettingsDeleteDialog } from "../ui/settings-delete-dialog";
import { SettingsChangePasswordDialog } from "./settings-change-password-dialog";

export function SettingsAccount() {
  const user = useSessionStore((state) => state.user);
  const { deleteUser, isPending } = useDeleteUser();

  return (
    <div className="flex flex-col gap-12">
      <SettingsItem className="flex-col">
        <SettingsItemHeader
          title="General"
          action={
            <Button variant="link" asChild>
              <Link to={ROUTES.USER_PROFILE}>
                View profile
                <ArrowRightIcon pathClasses="stroke-current" />
              </Link>
            </Button>
          }
        />
        <GeneralForm
          defaultValues={{
            email: user?.email || "",
            phoneNumber: user?.phone_number || "",
          }}
        />
      </SettingsItem>

      <Separator />

      <SettingsItem className="flex-col items-start w-[50%]">
        <SettingsItemHeader title="Account updates" />

        <SettingsChangePasswordDialog
          trigger={
            <Button variant="link">
              <LockIcon pathClasses="stroke-current" />
              Change password
            </Button>
          }
        />

        <SettingsDeleteDialog
          onDelete={deleteUser}
          isPending={isPending}
          trigger={
            <Button variant="link-destructive">
              <TrashIcon pathClasses="fill-current" />
              Delete account
            </Button>
          }
        />
      </SettingsItem>
    </div>
  );
}
