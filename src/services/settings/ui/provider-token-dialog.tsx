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
import { Input } from "@/shared/ui/kit/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import {
  usePostApiKey,
  type ProviderTokenSource,
} from "../model/use-post-api-key";
import type { AddApiKeyAction } from "./add-api-key-dialog.types";

const titleMap: Record<ProviderTokenSource, string> = {
  huggingface: "Hugging Face Key",
  "remote-url": "Remote URL Key",
};

const descriptionMap: Record<ProviderTokenSource, string> = {
  huggingface:
    "The provided link points to a private Hugging Face repository. Please add your Hugging Face API key to grant access.",
  "remote-url":
    "The provided link points to a remote URL. Please add your Remote URL API key to grant access.",
};

const tokenInputLabelMap: Record<ProviderTokenSource, string> = {
  huggingface: "Hugging Face Key",
  "remote-url": "Remote URL Key",
};

const providerTokenSchema = z.object({
  apiKey: z.string().nonempty("API Key is required"),
});

type ProviderTokenFormValues = z.infer<typeof providerTokenSchema>;

export function ProviderTokenDialog({
  provider,
  action,
  trigger,
  showDescription,
  ...props
}: React.ComponentProps<typeof Dialog> & {
  provider: ProviderTokenSource;
  action: AddApiKeyAction;
  trigger?: React.ReactNode;
  showDescription?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(providerTokenSchema),
    defaultValues: {
      apiKey: "",
    },
  });
  const { postApiKey, isPending, errorMessage } = usePostApiKey();

  const submit = (data: ProviderTokenFormValues) => {
    const close = () => {
      setOpen(false);
      props.onOpenChange?.(false);
    };
    postApiKey(
      {
        token: data.apiKey,
        provider,
      },
      close,
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen} {...props}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent>
        <form className="flex flex-col gap-8" onSubmit={handleSubmit(submit)}>
          <DialogHeader>
            <DialogTitle>{`${action} ${titleMap[provider]}`}</DialogTitle>
            {showDescription && (
              <DialogDescription>{descriptionMap[provider]}</DialogDescription>
            )}
          </DialogHeader>
          <div>
            <Input
              label={tokenInputLabelMap[provider]}
              {...register("apiKey")}
              error={errors.apiKey?.message || errorMessage?.toString()}
            />
          </div>
          <DialogFooter>
            <Button isLoading={isPending} className="flex-1" type="submit">
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
