import { Button } from "@/shared/ui/kit/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/kit/dialog";
import { useState } from "react";
import { useChangePassword } from "../model/use-change-password";
import { useCheckPassword } from "../model/use-check-password";
import { ChangePasswordForm } from "../ui/change-password-form";
import { NewPasswordForm } from "../ui/new-password-form";

export function SettingsChangePasswordDialog({
  trigger,
  ...props
}: React.ComponentProps<typeof Dialog> & {
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  const {
    checkPassword,
    token,
    isPending: isCheckingPassword,
    errorMessage: errorMessageCheck,
    resetState,
  } = useCheckPassword();
  const {
    changePassword,
    isPending: isChangingPassword,
    errorMessage: errorMessageChange,
  } = useChangePassword();

  // Determine if password was confirmed based on token presence
  const oldPasswordConfirmed = !!token;

  const description = oldPasswordConfirmed
    ? "Please enter new password"
    : "Please enter your current password to proceed";
  const buttonText = oldPasswordConfirmed ? "Save" : "Continue";
  const isPending = isCheckingPassword || isChangingPassword;

  const handleCurrentPasswordSubmit = (values: { currentPassword: string }) => {
    checkPassword({ currentPassword: values.currentPassword });
  };

  const handleNewPasswordSubmit = (values: { newPassword: string }) => {
    if (!token) return;
    changePassword({ password: values.newPassword, token }, () => {
      setOpen(false);
      resetState();
    });
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) resetState();
    props.onOpenChange?.(newOpen);
  };

  return (
    <Dialog {...props} open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {oldPasswordConfirmed ? (
          <NewPasswordForm
            id="change-password-form"
            onSubmit={handleNewPasswordSubmit}
            errorMessage={errorMessageChange}
          />
        ) : (
          <ChangePasswordForm
            id="change-password-form"
            onSubmit={handleCurrentPasswordSubmit}
            errorMessage={errorMessageCheck}
          />
        )}

        <DialogFooter>
          <Button
            form="change-password-form"
            className="flex-1"
            type="submit"
            isLoading={isPending}
          >
            {buttonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
