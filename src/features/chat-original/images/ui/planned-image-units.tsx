import { cn } from "@/shared/lib/css";
import { Card, CardImage } from "@/shared/ui/kit/card";
import { Checklist } from "@/shared/ui/kit/checklist";
import {
  ComparisonCard,
  type ComparisonCardItem,
} from "@/shared/ui/kit/comparison-card";
import { HeaderImage } from "@/shared/ui/kit/header-image";
import type { ImageItem } from "@/shared/ui/kit/images-viewer";
import { Skeleton } from "@/shared/ui/kit/skeleton";

import { pendingImageEffectClassName, type PlannedUnit } from "../lib/image-units";
import { ClickableImage } from "./clickable-image";

export type UnitRendererProps = {
  images: ImageItem[];
  aspectRatio: string | undefined;
  onImageClick: (index: number) => void;
};

function HeaderImages({ images, aspectRatio, onImageClick }: UnitRendererProps) {
  const first = images[0];
  if (!first) return null;

  const style = aspectRatio ? { aspectRatio } : undefined;

  return (
    <ClickableImage
      onClick={() => onImageClick(0)}
      disabled={first.isLoading}
      aria-label={first.alt || "View image"}
      className="block w-full rounded-[4px]"
    >
      <HeaderImage
        isLoading={first.isLoading}
        src={first.src}
        alt={first.alt}
        className={cn(
          "rounded-[4px]",
          first.isLoading && pendingImageEffectClassName,
        )}
        style={style}
      />
    </ClickableImage>
  );
}

function ChecklistImages({
  images,
  aspectRatio,
  onImageClick,
}: UnitRendererProps) {
  const style = aspectRatio ? { aspectRatio } : undefined;

  return (
    <Checklist
      items={images}
      renderItem={(image, index) =>
        image.isLoading ? (
          <Skeleton
            className={cn(
              "w-[120px] shrink-0 rounded-[4px]",
              pendingImageEffectClassName,
              !aspectRatio && "h-[120px]",
            )}
            style={style}
          />
        ) : (
          <ClickableImage
            onClick={() => onImageClick(index)}
            aria-label={image.alt ?? `View image ${index + 1}`}
            className="shrink-0 rounded-[4px]"
          >
            <img
              src={image.src}
              alt={image.alt ?? `Image ${index + 1}`}
              loading="lazy"
              draggable={false}
              className={cn(
                "w-[120px] shrink-0 rounded-[4px] object-cover",
                !aspectRatio && "h-[120px]",
              )}
              style={style}
            />
          </ClickableImage>
        )
      }
    />
  );
}

function ComparisonImages({
  images,
  aspectRatio,
  onImageClick,
}: UnitRendererProps) {
  const items: ComparisonCardItem[] = images.map((image, index) => ({
    status: "accepted",
    isLoading: image.isLoading,
    src: image.src,
    alt: image.alt ?? `Image ${index + 1}`,
    loading: "lazy",
    onClick: image.isLoading ? undefined : () => onImageClick(index),
    className: "cursor-pointer",
    ...(aspectRatio ? { style: { aspectRatio } } : {}),
  }));

  return <ComparisonCard items={items} />;
}

function CardsImages({ images, aspectRatio, onImageClick }: UnitRendererProps) {
  return (
    <div className="flex items-start gap-5">
      {images.map((image, index) => {
        return (
          <Card
            key={index}
            variant="ghost"
            orientation="vertical"
            spacing="none"
            className="flex-1 min-w-0 gap-3"
          >
            <ClickableImage
              onClick={() => onImageClick(index)}
              disabled={image.isLoading}
              aria-label={image.alt ?? `View image ${index + 1}`}
              className="w-full rounded-[4px]"
            >
              <CardImage
                isLoading={image.isLoading}
                src={image.src}
                alt={image.alt ?? `Image ${index + 1}`}
                loading="lazy"
                draggable={false}
                className={cn(
                  "rounded-[4px] object-cover",
                  image.isLoading && pendingImageEffectClassName,
                )}
                style={aspectRatio ? { aspectRatio } : undefined}
              />
            </ClickableImage>
          </Card>
        );
      })}
    </div>
  );
}

const imagesMap: Record<PlannedUnit, React.ComponentType<UnitRendererProps>> = {
  header: HeaderImages,
  checklist: ChecklistImages,
  comparison: ComparisonImages,
  cards: CardsImages,
};

export function ChatMessageImagesPlanned({
  unit,
  images,
  aspectRatio,
  onImageClick,
}: {
  unit: PlannedUnit;
  images: ImageItem[];
  aspectRatio: string | undefined;
  onImageClick: (index: number) => void;
}) {
  const ImageRenderer = imagesMap[unit];
  if (!ImageRenderer) return null;

  return (
    <ImageRenderer
      images={images}
      aspectRatio={aspectRatio}
      onImageClick={onImageClick}
    />
  );
}
