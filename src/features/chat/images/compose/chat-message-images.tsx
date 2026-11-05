import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import type { ApiSchemas } from "@/shared/api/schema";
import { cn } from "@/shared/lib/css";
import { useInView } from "@/shared/lib/react/use-in-view";
import type { PathParams, ROUTES } from "@/shared/model/routes";
import {
  ImagesViewer,
  ImagesViewerLightbox,
} from "@/shared/ui/kit/images-viewer";

import { useIsLastAssistantMessage } from "../../_model/use-last-message";
import {
  PLANNED_UNITS,
  pendingImageEffectClassName,
  type PlannedUnit,
} from "../lib/image-units";
import { padImages } from "../lib/pad-images";
import { parseAspectRatio } from "../lib/parse-aspect-ratio";
import { useMessageImages } from "../model/use-attachment-images";
import { useHighlightRegenerateImage } from "../model/use-highlight-regenerate-image";
import type { ChatImageEditCompletePayload } from "../model/use-image-highlight-editor";
import { ImageEditComparison } from "../ui/image-edit-comparison";
import { ChatMessageImagesPlanned } from "../ui/planned-image-units";
import { ChatImageHighlightController } from "./chat-image-highlight-controller";

type ChatMessageImagesProps = {
  message: ApiSchemas["ChatMessageDto"];
};

export function ChatMessageImages({ message }: ChatMessageImagesProps) {
  const { chat_id } = useParams<PathParams[typeof ROUTES.CHAT]>();
  const { ref, isInView } = useInView<HTMLDivElement>({ once: true });
  const isLatestAssistantMessage = useIsLastAssistantMessage(message.message_id);
  const shouldLoadImages = isInView || isLatestAssistantMessage;
  const images = useMessageImages(chat_id, message, shouldLoadImages);
  const plan = message.metadata?.image_plan;
  const unit = plan?.unit;
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxStartIndex, setLightboxStartIndex] = useState(0);
  const [editComparison, setEditComparison] =
    useState<ChatImageEditCompletePayload | null>(null);
  const {
    regenerateHighlightImage,
    cancelHighlightRegenerateImage,
    commitEditedImage,
  } = useHighlightRegenerateImage(message);

  const aspectRatio = parseAspectRatio(plan?.unit_spec?.aspect_ratio);
  const paddingCount = plan?.image_count ?? 0;

  const paddedImages = useMemo(
    () => (paddingCount > 0 ? padImages(images, paddingCount) : images),
    [images, paddingCount],
  );

  const loadedImages = useMemo(
    () => paddedImages.filter((img) => !img.isLoading && img.src),
    [paddedImages],
  );

  const handleImageClick = (paddedIndex: number) => {
    const clicked = paddedImages[paddedIndex];
    if (!clicked || clicked.isLoading || !clicked.src) return;
    const loadedIndex = loadedImages.findIndex((img) => img === clicked);
    if (loadedIndex === -1) return;
    setLightboxStartIndex(loadedIndex);
    setLightboxOpen(true);
  };

  // When an edit finishes, close the lightbox and open the comparison popup.
  const handleEditComplete = (payload: ChatImageEditCompletePayload) => {
    setLightboxOpen(false);
    setEditComparison(payload);
  };

  // Close the comparison popup and reopen the gallery on the same image.
  const closeComparisonAndReopen = (index: number) => {
    setEditComparison(null);
    setLightboxStartIndex(index);
    setLightboxOpen(true);
  };

  const handleUseEdited = () => {
    if (!editComparison) return;
    commitEditedImage(editComparison.result);
    closeComparisonAndReopen(editComparison.index);
  };

  // The backend currently always supersedes with the edited image, so keeping
  // the original is only a UI choice for now. Once a revert API exists, call
  // it here. Until then we just dismiss the popup and leave the original.
  const handleKeepOriginal = () => {
    if (!editComparison) return;
    closeComparisonAndReopen(editComparison.index);
  };

  if (paddedImages.length === 0) return null;

  const isPlanned = !!(plan && unit && PLANNED_UNITS.includes(unit));

  return (
    <div ref={ref} className="w-full">
      {isPlanned ? (
        <ChatMessageImagesPlanned
          unit={unit as PlannedUnit}
          images={paddedImages}
          aspectRatio={aspectRatio}
          onImageClick={handleImageClick}
        />
      ) : (
        <ImagesViewer
          images={paddedImages}
          size="md"
          imageClassName={cn(
            paddedImages.length === 1 && "!h-[400px] !w-[530px]",
          )}
          skeletonClassName={pendingImageEffectClassName}
          onImageClick={handleImageClick}
        />
      )}

      {loadedImages.length > 0 && (
        <ImagesViewerLightbox
          key={lightboxOpen ? "open" : "closed"}
          images={loadedImages}
          open={lightboxOpen}
          onOpenChange={setLightboxOpen}
          startIndex={lightboxStartIndex}
          aspectRatio={aspectRatio}
        >
          <ChatImageHighlightController
            onHighlightRegenerateImage={
              isLatestAssistantMessage ? regenerateHighlightImage : undefined
            }
            onCancelHighlightRegenerateImage={cancelHighlightRegenerateImage}
            onEditComplete={handleEditComplete}
          />
        </ImagesViewerLightbox>
      )}

      {editComparison && (
        <ImageEditComparison
          open
          onOpenChange={(open) => !open && setEditComparison(null)}
          title={editComparison.title}
          originalSrc={editComparison.originalSrc}
          originalAlt={editComparison.originalAlt}
          editedSrc={editComparison.result.editedUrl}
          editedAlt={editComparison.originalAlt}
          onKeepOriginal={handleKeepOriginal}
          onUseEdited={handleUseEdited}
        />
      )}
    </div>
  );
}
