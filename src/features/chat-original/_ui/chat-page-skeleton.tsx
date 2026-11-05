import { Skeleton } from "@/shared/ui/kit/skeleton";
import { ChatInputLayout, ChatLayout } from "./chat-layout";

function ChatMessageSkeleton() {
  return (
    <div className="flex items-end justify-end w-full">
      <Skeleton className="h-[56px] w-[521px]" />
    </div>
  );
}

function ChatAnswerSkeleton() {
  return (
    <div className="flex flex-col gap-[16px] w-full">
      <div className="flex flex-col gap-[8px] w-full">
        <Skeleton className="h-[28px] w-[274px]" />
        <Skeleton className="h-[21px] w-[672px]" />
        <Skeleton className="h-[21px] w-[544px]" />
        <Skeleton className="h-[21px] w-[476px]" />
        <Skeleton className="h-[21px] w-[429px]" />
      </div>
      <div className="flex gap-[8px]">
        <Skeleton className="size-[36px]" />
        <Skeleton className="size-[36px]" />
      </div>
    </div>
  );
}

export function ChatPageSkeleton() {
  return (
    <ChatLayout className="relative h-screen py-15 overflow-hidden">
      <div className="flex flex-col gap-[24px]">
        <ChatMessageSkeleton />
        <ChatAnswerSkeleton />
      </div>

      <ChatInputLayout className="absolute z-1 bottom-15">
        <Skeleton className="h-[72px] w-full" />
      </ChatInputLayout>
    </ChatLayout>
  );
}
