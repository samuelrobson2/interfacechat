import { useState, type ComponentProps } from "react";
import {
  TogetherProviderTokenDialog,
  TOGETHER_AI_PROVIDER,
  useDeleteProviderKey,
  useProviderKeysSuspense,
} from "@/services/settings";
import { Button } from "@/shared/ui/kit/button";
import {
  SettingsItem,
  SettingsItemContent,
  SettingsItemHeader,
} from "../_ui/settings-item";
import { ShieldIcon } from "@/shared/assets/icons/general/Shield";
import { TrashIcon } from "@/shared/assets/icons/general/Trash";
import togetherAiImage from "@/shared/assets/images/together-ai.svg";
import { toast } from "@/shared/ui/kit/sonner-toast";
import { getApiErrorMessage } from "@/shared/api/api-error";
import { ConfirmDeleteApiKeyDialog } from "./confirm-delete-api-key-dialog";

export function SettingsTogetherProviderKey(
  props: ComponentProps<typeof SettingsItem>,
) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { keys } = useProviderKeysSuspense();
  const { deleteProviderKey, isPending: isDeleting } = useDeleteProviderKey();
  const togetherAiProviderKeySummary = keys.find(
    (row) => row.provider === TOGETHER_AI_PROVIDER,
  );
  const hasStoredProviderKey = Boolean(togetherAiProviderKeySummary);

  const handleDeleteKey = async () => {
    try {
      await deleteProviderKey(TOGETHER_AI_PROVIDER, () => {
        setIsDeleteDialogOpen(false);
      });
      toast.success("Together AI key deleted");
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Could not delete Together AI key"),
      );
    }
  };

  return (
    <>
      <SettingsItem
        icon={<img src={togetherAiImage} alt="Together AI" />}
        {...props}
      >
        <SettingsItemContent pinActionToBottom>
          <SettingsItemHeader
            title="Together AI"
            description={
              hasStoredProviderKey ? (
                <>
                  An API key is active. Its value is hidden for security
                  reasons.
                  <ShieldIcon pathClasses="stroke-green-5" />
                </>
              ) : (
                "You don’t have an API key yet"
              )
            }
          />

          <div className="flex items-center gap-2">
            <TogetherProviderTokenDialog
              action={hasStoredProviderKey ? "Update" : "Add"}
              trigger={
                <Button variant="secondary">
                  {hasStoredProviderKey ? "Update Key" : "Add Key"}
                </Button>
              }
            />
            {hasStoredProviderKey ? (
              <Button
                variant="secondary"
                size="icon_14"
                aria-label="Delete Together AI key"
                onClick={() => setIsDeleteDialogOpen(true)}
                disabled={isDeleting}
              >
                <TrashIcon pathClasses="fill-red-5" svgClasses="size-5" />
              </Button>
            ) : null}
          </div>
        </SettingsItemContent>
      </SettingsItem>

      <ConfirmDeleteApiKeyDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteKey}
        isLoading={isDeleting}
      />
    </>
  );
}
