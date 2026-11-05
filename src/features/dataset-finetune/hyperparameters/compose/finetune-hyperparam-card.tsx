import type { ReactNode } from "react";
import { Card } from "@/shared/ui/kit/card";
import { Text } from "@/shared/ui/kit/text";
import { cn } from "@/shared/lib/css";

type FinetuneHyperparamCardProps = {
  title: string;
  imageSrc: string;
  adaptedSlot: ReactNode;
  errorMessage?: string;
  className?: string;
};

export function FinetuneHyperparamCard({
  title,
  imageSrc,
  adaptedSlot,
  errorMessage,
  className,
}: FinetuneHyperparamCardProps) {
  return (
    <Card
      variant="default"
      shape="square"
      spacing="md"
      className={cn(
        "w-full max-w-[280px] justify-self-center shadow-sm",
        className,
      )}
    >
      <div className="flex flex-col gap-[16px]">
        <img
          src={imageSrc}
          alt={title}
          className="w-[90px] h-[90px] object-contain self-center"
        />
        <Text variant="title" className="text-center">
          {title}
        </Text>

        <div className="mt-auto">{adaptedSlot}</div>

        <div>
          {errorMessage ? (
            <Text variant="label" color="error" className="text-center">
              {errorMessage}
            </Text>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
