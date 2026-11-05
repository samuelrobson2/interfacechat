import { AlertFilledIcon } from "@/shared/assets/icons/general/AlertFilled";
import { CircleCheckFilledIcon } from "@/shared/assets/icons/general/CircleCheckFilled";
import { CircleInfoFilledIcon } from "@/shared/assets/icons/general/CircleInfoFilled";
import { CrossLargeIcon } from "@/shared/assets/icons/outlined/CrossLarge";
import { LoaderIcon } from "@/shared/assets/icons/outlined/Loader";
import { useTheme } from "next-themes";
import {
  Toaster as Sonner,
  toast as sonnerToast,
  type ExternalToast,
  type ToasterProps,
} from "sonner";
import { Button } from "../button";
import { Card } from "../card";
import { Text } from "../text";
import { Link } from "react-router-dom";

type ToastType = "success" | "warning" | "error" | "loading" | "info";

type ToastButton = {
  label: string;
  onClick?: () => void;
  variant?: "secondary" | "link";
  link?: string;
};

interface ToastOptions extends ExternalToast {
  button?: ToastButton;
}

interface ToastProps {
  id: string | number;
  type: ToastType;
  title: string;
  description?: React.ReactNode | (() => React.ReactNode);
  button?: ToastButton;
}

const TOAST_ICONS: Record<ToastType, React.ReactNode> = {
  success: <CircleCheckFilledIcon pathClasses="fill-green-5" />,
  info: <CircleInfoFilledIcon pathClasses="fill-blue-5" />,
  warning: <CircleInfoFilledIcon pathClasses="fill-orange-5" />,
  error: <AlertFilledIcon pathClasses="fill-red-5" />,
  loading: <LoaderIcon className="animate-spin" />,
};

export const Toast = ({ id, type, title, description, button }: ToastProps) => {
  const isLoading = type === "loading";

  return (
    <Card className="flex-row justify-between items-start w-[360px]">
      <div className="flex items-start gap-2">
        <div className="shrink-0 size-6">{TOAST_ICONS[type]}</div>
        <div className="flex flex-col items-start gap-1">
          <Text>{title}</Text>
          {description && (
            <Text variant="label" color="secondary">
              {typeof description === "function" ? description() : description}
            </Text>
          )}
          {button && (
            <Button
              onClick={button.onClick}
              variant={button.variant || "link"}
              size="40"
              asChild={!!button.link}
            >
              {button.link ? (
                <Link to={button.link}>{button.label}</Link>
              ) : (
                button.label
              )}
            </Button>
          )}
        </div>
      </div>
      {!isLoading && (
        <button
          onClick={() => sonnerToast.dismiss(id)}
          className="shrink-0 cursor-pointer pt-1"
          aria-label="Close notification"
          tabIndex={0}
        >
          <CrossLargeIcon className="size-4" />
        </button>
      )}
    </Card>
  );
};

export const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position="bottom-right"
      toastOptions={{ unstyled: true }}
      {...props}
    />
  );
};

// Explicit interface prevents leaking sonner's internal PromiseIExtendedResult into .d.ts
interface ToastAPI {
  success: (title: string, options?: ToastOptions) => string | number;
  error: (title: string, options?: ToastOptions) => string | number;
  warning: (title: string, options?: ToastOptions) => string | number;
  info: (title: string, options?: ToastOptions) => string | number;
  loading: (title: string, options?: ToastOptions) => string | number;
  dismiss: (toastId?: string | number) => void;
  promise: (
    promise: Promise<unknown> | (() => Promise<unknown>),
    data?: ExternalToast,
  ) => string | number;
}

export const toast: ToastAPI = {
  success: (title, options) =>
    sonnerToast.custom((t) => (
      <Toast id={t} type="success" title={title} {...options} />
    )),
  error: (title, options) =>
    sonnerToast.custom((t) => (
      <Toast id={t} type="error" title={title} {...options} />
    )),
  warning: (title, options) =>
    sonnerToast.custom((t) => (
      <Toast id={t} type="warning" title={title} {...options} />
    )),
  info: (title, options) =>
    sonnerToast.custom((t) => (
      <Toast id={t} type="info" title={title} {...options} />
    )),
  loading: (title, options) =>
    sonnerToast.custom((t) => (
      <Toast id={t} type="loading" title={title} {...options} />
    )),
  dismiss: (toastId) => sonnerToast.dismiss(toastId),
  promise: (promise, data) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sonnerToast.promise(promise as any, data) as unknown as string | number,
};
