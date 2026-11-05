import { Dialog } from "@/shared/ui/kit/dialog";
import type { ApiSchemas } from "@/shared/api/schema";
import {
  type ImportSourceProvider,
  type ProviderTokenSource,
} from "../model/settings-connection-providers";
import type { AddApiKeyAction } from "./add-api-key-dialog.types";
import { CreateApiKeyDialog } from "./create-api-key-dialog";
import { ProviderTokenDialog } from "./provider-token-dialog";
import { API_KEY_PROVIDER } from "@/services/settings";

function isProviderTokenSource(
  provider: ImportSourceProvider | typeof API_KEY_PROVIDER,
): provider is ProviderTokenSource {
  return provider === "huggingface" || provider === "remote-url";
}

export function AddApiKeyDialog({
  provider,
  action,
  trigger,
  showDescription,
  apiKeys,
  ...props
}: React.ComponentProps<typeof Dialog> & {
  provider: ImportSourceProvider | typeof API_KEY_PROVIDER;
  action: AddApiKeyAction;
  trigger?: React.ReactNode;
  showDescription?: boolean;
  apiKeys?: ApiSchemas["ApiKeyResponseDto"][];
}) {
  if (provider === API_KEY_PROVIDER) {
    return (
      <CreateApiKeyDialog
        action={action}
        trigger={trigger}
        showDescription={showDescription}
        apiKeys={apiKeys}
        {...props}
      />
    );
  }

  if (!isProviderTokenSource(provider)) {
    return null;
  }

  return (
    <ProviderTokenDialog
      provider={provider}
      action={action}
      trigger={trigger}
      showDescription={showDescription}
      {...props}
    />
  );
}
