import type { ComponentProps, ReactNode } from "react";
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
import { toast } from "@/shared/ui/kit/sonner-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { getApiErrorMessage } from "@/shared/api/api-error";
import { TOGETHER_AI_PROVIDER } from "../model/provider-keys.constants";
import { useStoreProviderKey } from "../model/use-store-provider-key";
import { useValidateProviderKey } from "../model/use-validate-provider-key";
import type { AddApiKeyAction } from "./add-api-key-dialog.types";

const togetherTokenSchema = z.object({
  apiKey: z
    .string()
    .min(8, "API key must be at least 8 characters")
    .max(4096, "API key is too long"),
});

type TogetherTokenFormValues = z.infer<typeof togetherTokenSchema>;

type TogetherProviderTokenDialogProps = ComponentProps<typeof Dialog> & {
  action: AddApiKeyAction;
  trigger?: ReactNode;
};

export function TogetherProviderTokenDialog({
  action,
  trigger,
  onOpenChange,
  ...props
}: TogetherProviderTokenDialogProps) {
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const { storeProviderKey, isPending: isSaving } = useStoreProviderKey();
  const { validateProviderKey, isPending: isValidating } =
    useValidateProviderKey();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(togetherTokenSchema),
    defaultValues: {
      apiKey: "",
    },
  });

  const isBusy = isValidating || isSaving;

  const close = () => {
    setOpen(false);
    onOpenChange?.(false);
    reset({ apiKey: "" });
    setFeedback(null);
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    onOpenChange?.(next);
    if (!next) {
      reset({ apiKey: "" });
      setFeedback(null);
    }
  };

  const submit = async (data: TogetherTokenFormValues) => {
    const trimmed = data.apiKey.trim();
    setFeedback(null);
    try {
      const validation = await validateProviderKey({
        provider: TOGETHER_AI_PROVIDER,
        body: { api_key: trimmed },
      });

      if (!validation.valid) {
        setFeedback(JSON.stringify(validation, null, 2));
        return;
      }

      await storeProviderKey(
        {
          provider: TOGETHER_AI_PROVIDER,
          api_key: trimmed,
        },
        () => {
          reset({ apiKey: "" });
          setFeedback(null);
          close();
        },
      );
      toast.success("Together AI key saved");
    } catch (e) {
      setFeedback(getApiErrorMessage(e, "Could not validate or save key"));
    }
  };

  const fieldError = errors.apiKey?.message ?? feedback ?? undefined;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange} {...props}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent>
        <form className="flex flex-col gap-8" onSubmit={handleSubmit(submit)}>
          <DialogHeader>
            <DialogTitle>{`${action} Together AI key`}</DialogTitle>
          </DialogHeader>
          <div>
            <Input
              label="Together AI key"
              {...register("apiKey", {
                onChange: () => {
                  setFeedback(null);
                },
              })}
              error={
                fieldError && (
                  <span className="block max-h-40 overflow-y-auto whitespace-pre-wrap break-words font-mono text-xs">
                    {fieldError}
                  </span>
                )
              }
            />
          </div>
          <DialogFooter>
            <Button className="flex-1" type="submit" isLoading={isBusy}>
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
