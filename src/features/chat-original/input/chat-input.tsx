import {
  ChatComposerSendButton,
  ChatComposerStopButton,
  ChatTextareaComposer,
} from "@/services/chat/_ui/chat-input-composer";
import { CrossLargeIcon } from "@/shared/assets/icons/outlined/CrossLarge";
import { cn } from "@/shared/lib/css";
import {
  FileUpload,
  FileUploadAttachmentContent,
  FileUploadAttachmentTrigger,
} from "@/shared/ui/kit/file-upload";
import { useCreateChat } from "../_model/messaging/use-create-session";
import { useSendMessage } from "../_model/messaging/use-send-message";
import { useStopGeneration } from "../_model/messaging/use-stop-generation";
import {
  CHAT_ALLOWED_ATTACHMENT_CONTENT_TYPES,
  useUploadChatAttachments,
} from "../_model/messaging/use-upload-chat-attachments";
import { useChatContext } from "../_model/store/chat-store";
import { useInputStore } from "../_model/store/input-store";

export function ChatInput({
  isNewChat = false,
  onClose,
  glossy = false,
}: {
  isNewChat?: boolean;
  onClose?: () => void;
  /** Extra elevation used on Studio; Pharos composer already has its own frame. */
  glossy?: boolean;
}) {
  const message = useInputStore((state) => state.message);
  const setMessage = useInputStore((state) => state.setMessage);
  const files = useInputStore((state) => state.files);
  const setFiles = useInputStore((state) => state.setFiles);
  const uploadedAttachments = useInputStore(
    (state) => state.uploadedAttachments,
  );
  const setUploadedAttachments = useInputStore(
    (state) => state.setUploadedAttachments,
  );
  const isGenerating = useChatContext((state) => state.isGenerating);
  const isRegenerating = useChatContext((state) => state.isRegenerating);

  const { sendUserMessage } = useSendMessage();
  const { createChat, isPending } = useCreateChat();
  const { stopGeneration } = useStopGeneration();
  const { handleFilesChange, handleRemoveFile, isUploadingAttachments } =
    useUploadChatAttachments(isNewChat);

  const isChatPending = isPending || isGenerating || isRegenerating;
  const canSubmit =
    Boolean(message?.trim()) &&
    !isGenerating &&
    !isRegenerating &&
    !isUploadingAttachments;

  const handleSend = () => {
    const trimmed = message?.trim();
    if (!trimmed || !canSubmit) return;

    if (isNewChat) {
      createChat({ input_source: "user_text", content: trimmed });
    } else {
      sendUserMessage({
        input_source: "user_text",
        content: trimmed,
        attachments: Array.from(uploadedAttachments.values()),
      });
      setFiles(new Map());
      setUploadedAttachments(new Map());
    }

    setMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <ChatTextareaComposer
      value={message}
      onChange={(e) => setMessage(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder="How can we help you?"
      frameClassName={cn(
        "min-h-[106px] md:min-h-[100px]",
        glossy && "shadow-[var(--shadow-inset-default)]",
      )}
      topAction={
        onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            title="Close"
            className={cn(
              "absolute top-4 right-4 z-10 grid size-4 place-items-center rounded-full bg-gray-2",
              "cursor-pointer opacity-0 transition-opacity group-hover:opacity-100",
            )}
          >
            <CrossLargeIcon
              svgClasses="size-3"
              pathClasses="stroke-icon-primary"
            />
          </button>
        )
      }
      leftActions={
        <FileUpload
          files={files}
          className={cn("flex-row items-center gap-1.5")}
        >
          <FileUploadAttachmentTrigger
            multiple
            onChange={handleFilesChange}
            className="size-8 rounded-[60px] p-0 [&_svg]:size-4"
            accept={CHAT_ALLOWED_ATTACHMENT_CONTENT_TYPES.join(",")}
            disabled={files.size >= 3 || isUploadingAttachments}
            maxFiles={3}
            tooltipContent={
              files.size >= 3 ? "Max files reached" : "Upload file"
            }
          />
          {Array.from(files.entries()).map(([fileKey, file]) => (
            <FileUploadAttachmentContent
              className="bg-background-primary"
              key={fileKey}
              fileKey={fileKey}
              file={file}
              onRemove={handleRemoveFile}
            />
          ))}
        </FileUpload>
      }
      rightActions={
        isChatPending ? (
          <ChatComposerStopButton
            onClick={stopGeneration}
            aria-label="Stop generation"
            title="Stop generation"
          />
        ) : (
          <ChatComposerSendButton
            active={canSubmit}
            onClick={handleSend}
            isLoading={isPending || isUploadingAttachments}
            disabled={!canSubmit}
          />
        )
      }
    />
  );
}
