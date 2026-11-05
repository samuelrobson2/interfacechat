import {
  ChatComposerLayout,
  ChatHeader,
  ChatInputLayout,
  ChatLayout,
} from "@/services/chat";
import { Skeleton } from "@/shared/ui/kit/skeleton";

export function VisualizeChatSkeleton() {
  return (
    <ChatLayout className="relative h-dvh max-w-[1280px] overflow-hidden">
      <ChatHeader
        start={<Skeleton className="h-[28px] w-[96px] rounded-[8px]" />}
      >
        <Skeleton className="h-[20px] w-[160px]" />
      </ChatHeader>

      <div className="h-full overflow-hidden pt-[88px] md:pt-[75px]">
        <div className="mx-auto flex w-full flex-col gap-6 px-4 md:w-[660px] md:px-0">
          <div className="flex justify-end">
            <Skeleton className="h-[58px] w-[70%] max-w-[420px] rounded-[16px]" />
          </div>
          <div className="relative flex w-full flex-col gap-4">
            <Skeleton className="size-[32px] rounded-full md:absolute md:top-0 md:right-full md:mr-4 md:size-[50px]" />
            <Skeleton className="h-[300px] w-full rounded-[14px]" />
          </div>
        </div>
      </div>

      <ChatComposerLayout>
        <div className="mx-auto w-full px-4 md:w-[660px] md:px-0">
          <ChatInputLayout className="pointer-events-none">
            <Skeleton className="h-[106px] w-full rounded-[16px] md:h-[100px]" />
          </ChatInputLayout>
        </div>
      </ChatComposerLayout>
    </ChatLayout>
  );
}
