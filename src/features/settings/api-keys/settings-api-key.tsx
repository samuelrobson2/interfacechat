import {
  AddApiKeyDialog,
  KAGGLE_OAUTH_PROVIDER,
  HUGGINGFACE_PROVIDER,
  API_KEY_PROVIDER,
  type SettingsApiKeyProvider,
  useDeleteSettingsApiToken,
} from "@/services/settings";
import {
  SettingsItem,
  SettingsItemContent,
  SettingsItemHeader,
} from "../_ui/settings-item";
import { ShieldIcon } from "@/shared/assets/icons/general/Shield";
import { Button } from "@/shared/ui/kit/button";
import {
  connectGoogleOAuth,
  connectKaggleOAuth,
  useDisconnectKaggleOAuth,
} from "@/services/auth";
import type { ApiSchemas } from "@/shared/api/schema";
import { ApiKeysTableDialog } from "./api-keys-table-dialog";
import { TrashIcon } from "@/shared/assets/icons/general/Trash";
import { useState } from "react";
import { toast } from "@/shared/ui/kit/sonner-toast";
import { getApiErrorMessage } from "@/shared/api/api-error";
import { ConfirmDeleteApiKeyDialog } from "./confirm-delete-api-key-dialog";

const OAUTH_CONNECT = {
  google_sheets: connectGoogleOAuth,
  kaggle_oauth: connectKaggleOAuth,
} as const;

type OAuthProvider = keyof typeof OAUTH_CONNECT;

export function SettingsApiKey({
  provider,
  apiKeyExists,
  apiKeys,
  icon,
  headerTitle,
  description,
  action,
  ...props
}: React.ComponentProps<typeof SettingsItem> & {
  provider: SettingsApiKeyProvider;
  apiKeyExists: boolean;
  apiKeys?: ApiSchemas["ApiKeyResponseDto"][];
  icon: React.ReactNode;
  headerTitle: string;
  description?: string;
  action?: "Update" | "Add" | "Create";
}) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { deleteSettingsApiToken, isPending: isDeletingToken } =
    useDeleteSettingsApiToken();
  const { disconnectKaggleOAuth, isPending: isDisconnectingKaggle } =
    useDisconnectKaggleOAuth();
  const isApiKeyProvider = provider === API_KEY_PROVIDER;
  const isKaggleOAuth = provider === KAGGLE_OAUTH_PROVIDER;
  const hasApiKeys = (apiKeys?.length ?? 0) > 0;
  const isDeleting = isDeletingToken || isDisconnectingKaggle;
  const canRemoveConnection =
    apiKeyExists && (provider === HUGGINGFACE_PROVIDER || isKaggleOAuth);

  const removeConnectionButton = canRemoveConnection ? (
    <Button
      variant="secondary"
      size="icon_14"
      aria-label={
        isKaggleOAuth ? `Disconnect ${headerTitle}` : `Delete ${headerTitle}`
      }
      onClick={() => setIsDeleteDialogOpen(true)}
      disabled={isDeleting}
    >
      <TrashIcon pathClasses="fill-red-5" svgClasses="size-5" />
    </Button>
  ) : null;

  const handleDeleteKey = async () => {
    try {
      if (isKaggleOAuth) {
        await disconnectKaggleOAuth(() => setIsDeleteDialogOpen(false));
        toast.success("Kaggle account disconnected");
        return;
      }

      if (provider !== "huggingface") return;

      await deleteSettingsApiToken("huggingface", () => {
        setIsDeleteDialogOpen(false);
      });
      toast.success("Hugging Face key deleted");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not remove connection"));
    }
  };

  return (
    <>
      <SettingsItem icon={icon} {...props}>
        <SettingsItemContent pinActionToBottom>
          <SettingsItemHeader
            title={headerTitle}
            description={
              description ||
              (apiKeyExists ? (
                <>
                  An API key is active. Its value is hidden for security
                  reasons.
                  <ShieldIcon pathClasses="stroke-green-5" />
                </>
              ) : (
                "You don't have an API key yet"
              ))
            }
          />

          {isApiKeyProvider ? (
            <div className="flex gap-3">
              {hasApiKeys && (
                <ApiKeysTableDialog
                  apiKeys={apiKeys ?? []}
                  trigger={
                    <Button variant="secondary" className="flex-1">
                      View keys
                    </Button>
                  }
                />
              )}
              <AddApiKeyDialog
                action="Create"
                provider={provider}
                apiKeys={apiKeys}
                trigger={
                  <Button variant="secondary" className="flex-1">
                    Create key
                  </Button>
                }
              />
            </div>
          ) : provider in OAUTH_CONNECT ? (
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => OAUTH_CONNECT[provider as OAuthProvider]()}
              >
                {apiKeyExists ? "Update" : "Connect"}
              </Button>
              {removeConnectionButton}
            </div>
          ) : provider === "huggingface" ? (
            <div className="flex items-center gap-2">
              <AddApiKeyDialog
                action={action ? action : apiKeyExists ? "Update" : "Add"}
                provider={provider}
                trigger={
                  <Button variant="secondary">
                    {apiKeyExists ? "Update Key" : "Add Key"}
                  </Button>
                }
              />
              {removeConnectionButton}
            </div>
          ) : null}
        </SettingsItemContent>
      </SettingsItem>

      <ConfirmDeleteApiKeyDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteKey}
        isLoading={isDeleting}
        title={isKaggleOAuth ? "Disconnect Kaggle?" : "Delete API key?"}
        description={
          isKaggleOAuth
            ? "Your Kaggle account will be unlinked from Adaption. You can reconnect at any time."
            : "This key will stop working for all integrations that use it. This action cannot be undone."
        }
        confirmLabel={isKaggleOAuth ? "Disconnect" : "Delete key"}
      />
    </>
  );
}
