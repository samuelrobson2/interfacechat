import { Button } from "@/shared/ui/kit/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/kit/dialog";
import { Input } from "@/shared/ui/kit/input";
import { CopyIcon } from "@/shared/assets/icons/general/Copy";
import { CircleInfoFilledIcon } from "@/shared/assets/icons/general/CircleInfoFilled";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { useCreateApiKey } from "../model/use-create-api-key";
import type { ApiSchemas } from "@/shared/api/schema";
import type { AddApiKeyAction } from "./add-api-key-dialog.types";
import { Alert, AlertDescription } from "@/shared/ui/kit/alert";
import { toast } from "@/shared/ui/kit/sonner-toast";

const createApiKeySchema = z.object({
  name: z.string().nonempty("Name is required"),
});

type CreateApiKeyFormValues = z.infer<typeof createApiKeySchema>;

export function CreateApiKeyDialog({
  action,
  trigger,
  apiKeys,
  ...props
}: React.ComponentProps<typeof Dialog> & {
  action: AddApiKeyAction;
  trigger?: React.ReactNode;
  showDescription?: boolean;
  apiKeys?: ApiSchemas["ApiKeyResponseDto"][];
}) {
  const [open, setOpen] = useState(false);
  const [generatedApiKey, setGeneratedApiKey] = useState<string | null>(null);
  const [generatedApiKeyName, setGeneratedApiKeyName] = useState<string>("");
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createApiKeySchema),
    defaultValues: {
      name: "",
    },
  });
  const { createApiKey, isPending, errorMessage } = useCreateApiKey();
  const nameValue = watch("name");
  const hasDuplicateName = (apiKeys ?? []).some(
    (apiKey) => apiKey.name === nameValue,
  );
  const duplicateNameError =
    nameValue && hasDuplicateName
      ? "API key with this name already exists"
      : "";

  const copyToClipboard = async (value: string) => {
    await navigator.clipboard.writeText(value);
    toast.success("API key copied to clipboard");
  };

  const submit = async (data: CreateApiKeyFormValues) => {
    if (duplicateNameError) return;
    const response = await createApiKey(data.name);
    const rawKey = (
      response as ApiSchemas["CreateApiKeyResponseDto"] | undefined
    )?.rawKey;
    if (!rawKey) return;

    setGeneratedApiKey(rawKey);
    setGeneratedApiKeyName(data.name);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setGeneratedApiKey(null);
      reset({ name: "" });
    }
    props.onOpenChange?.(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange} {...props}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent>
        {generatedApiKey ? (
          <div className="flex flex-col gap-8">
            <DialogHeader>
              <DialogTitle>API key is now available</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-3">
              <Alert className="flex items-center">
                <CircleInfoFilledIcon
                  svgClasses="size-10"
                  pathClasses="fill-orange-5"
                />
                <AlertDescription className="text-typography-primary">
                  Please copy your API key before closing the window. You won't
                  be able to view it again. You can always generate a new one if
                  needed.
                </AlertDescription>
              </Alert>
              <Input
                label={generatedApiKeyName}
                value={generatedApiKey}
                readOnly
                rightElement={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => copyToClipboard(generatedApiKey)}
                  >
                    <CopyIcon />
                  </Button>
                }
              />
            </div>
            <DialogFooter />
          </div>
        ) : (
          <form className="flex flex-col gap-8" onSubmit={handleSubmit(submit)}>
            <DialogHeader>
              <DialogTitle>{`${action} API Key`}</DialogTitle>
            </DialogHeader>
            <div>
              <Input
                label="Name"
                {...register("name")}
                error={
                  errors.name?.message || duplicateNameError || errorMessage
                }
              />
            </div>
            <DialogFooter>
              <Button
                isLoading={isPending}
                className="flex-1"
                type="submit"
                disabled={!!duplicateNameError}
              >
                Generate
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
