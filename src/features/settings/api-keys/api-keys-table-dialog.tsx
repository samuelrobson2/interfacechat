import { useState } from "react";
import { TrashIcon } from "@/shared/assets/icons/general/Trash";
import type { ApiSchemas } from "@/shared/api/schema";
import { Button } from "@/shared/ui/kit/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/kit/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/kit/table";
import { useRevokeApiKey } from "@/services/settings";
import { formatRelativeTime } from "../_lib/format-relative-time";
import { Text } from "@/shared/ui/kit/text";
import { ConfirmDeleteApiKeyDialog } from "./confirm-delete-api-key-dialog";

const TABLE_HEADERS = ["KEY NAME", "API KEY", "CREATED", "LAST USED"] as const;

export function ApiKeysTableDialog({
  apiKeys,
  trigger,
}: {
  apiKeys: ApiSchemas["ApiKeyResponseDto"][];
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [deletingApiKeyId, setDeletingApiKeyId] = useState<string | null>(null);
  const { revokeApiKey, isPending: isRevokingApiKey } = useRevokeApiKey();

  const closeDeleteDialog = () => setDeletingApiKeyId(null);

  const handleConfirmDelete = async () => {
    if (!deletingApiKeyId) return;
    await revokeApiKey(deletingApiKeyId, () => {
      closeDeleteDialog();
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent className="sm:max-w-[900px]">
          <DialogHeader>
            <DialogTitle>API keys</DialogTitle>
          </DialogHeader>
          <Table wrapperClassName="max-h-[420px]">
            <TableHeader className="bg-background-secondary">
              <TableRow>
                {TABLE_HEADERS.map((header) => (
                  <TableHead
                    key={header}
                    className="text-typography-secondary font-light"
                  >
                    {header}
                  </TableHead>
                ))}
                <TableHead className="w-14"> </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apiKeys.map((apiKey) => (
                <TableRow key={apiKey.id}>
                  <TableCell className="max-w-[300px] break-words whitespace-normal">
                    {apiKey.name}
                  </TableCell>
                  <TableCell>
                    <Text
                      color="secondary"
                      className="flex items-center font-mono"
                    >
                      {apiKey.keyPrefix.slice(0, 7)}
                      <Text className="flex items-center font-mono">
                        {apiKey.keyPrefix.slice(7)}
                        <Text
                          as="span"
                          variant="label"
                          className="font-mono tracking-[4px] ml-[4px]"
                        >
                          ••••
                        </Text>
                      </Text>
                    </Text>
                  </TableCell>
                  <TableCell>{formatRelativeTime(apiKey.createdAt)}</TableCell>
                  <TableCell>{formatRelativeTime(apiKey.lastUsedAt)}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setDeletingApiKeyId(apiKey.id)}
                      disabled={isRevokingApiKey}
                    >
                      <TrashIcon pathClasses="fill-red-5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <DialogFooter showCancelButton={false}>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteApiKeyDialog
        open={deletingApiKeyId !== null}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) closeDeleteDialog();
        }}
        onConfirm={handleConfirmDelete}
        isLoading={isRevokingApiKey}
        title="Are you sure you want to delete the API key?"
        description="This action cannot be undone."
      />
    </>
  );
}
