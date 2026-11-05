import { DownloadIconThin } from "@/shared/assets/icons/outlined/DownloadThin";
import { DownloadIconNormal } from "@/shared/assets/icons/outlined/DownloadNormal";
import {
  captureElementAsBlob,
  waitForFrames,
} from "@/shared/lib/html-to-image-webkit";
import { cn } from "@/shared/lib/css";
import { downloadFile } from "@/shared/lib/js";
import { Button, type ButtonProps } from "@/shared/ui/kit/button";
import { toast } from "@/shared/ui/kit/sonner-toast";
import { useCallback, useRef, useState } from "react";

export function useChartDownload(fileName: string) {
  const ref = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadImage = useCallback(
    async (beforeCapture?: () => void | Promise<void>) => {
      const element = ref.current;
      if (!element || isDownloading) return;

      setIsDownloading(true);
      try {
        await beforeCapture?.();
        await waitForFrames(2);
        const blob = await captureElementAsBlob(element, {
          pixelRatio: 2,
          filter: (node) =>
            !(
              node instanceof HTMLElement &&
              node.hasAttribute("data-hide-from-chart-download")
            ),
        });
        downloadFile(
          blob,
          fileName.endsWith(".png") ? fileName : `${fileName}.png`,
        );
      } catch (error) {
        console.error("Failed to download chart as image:", error);
        toast.error("Failed to download chart");
      } finally {
        setIsDownloading(false);
      }
    },
    [fileName, isDownloading],
  );

  return { ref, handleDownloadImage, isDownloading };
}

export function ChartDownloadButton({
  size = "icon-sm",
  iconVariant = "thin",
  "aria-label": ariaLabel = "Download chart as image",
  title = "Download chart",
  className,
  ...props
}: Omit<ButtonProps, "children" | "type"> & {
  iconVariant?: "thin" | "normal";
}) {
  return (
    <Button
      type="button"
      variant="icon-button"
      size={size}
      lottieClassName={iconVariant === "thin" ? "size-4" : "size-6"}
      aria-label={ariaLabel}
      title={title}
      className={cn("hover:bg-background-primary", className)}
      {...props}
    >
      {iconVariant === "thin" ? (
        <DownloadIconThin svgClasses="size-4" />
      ) : (
        <DownloadIconNormal />
      )}
    </Button>
  );
}

export function ChartDownloadFrame({
  fileName,
  children,
  className,
  disabled,
  onBeforeCapture,
}: {
  fileName: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onBeforeCapture?: () => void | Promise<void>;
}) {
  const { ref, handleDownloadImage, isDownloading } =
    useChartDownload(fileName);

  return (
    <div className={cn("relative", className)}>
      <div className="absolute right-0 top-0 z-10">
        <ChartDownloadButton
          size="icon_6"
          iconVariant="normal"
          disabled={disabled}
          isLoading={isDownloading}
          onClick={() => handleDownloadImage(onBeforeCapture)}
        />
      </div>
      <div ref={ref} className="pr-10">
        {children}
      </div>
    </div>
  );
}
