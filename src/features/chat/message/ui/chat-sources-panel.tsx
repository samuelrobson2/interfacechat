import { CrossLargeIcon } from "@/shared/assets/icons/outlined/CrossLarge";
import { cn } from "@/shared/lib/css";
import { Text } from "@/shared/ui/kit/text";
import { toExternalHref, type ChatSource } from "../lib/chat-sources";

export function ChatSourcesPopup({
  onClose,
  sources,
  className,
}: {
  onClose: () => void;
  sources: ChatSource[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex w-full flex-col gap-3 overflow-hidden rounded-[12px] border border-gray-2 bg-gray-6 p-4",
        className,
      )}
    >
      <div className="flex items-start justify-between border-b border-gray-2 pb-3">
        <Text variant="label" color="primary">
          Sources
        </Text>
        <button
          type="button"
          aria-label="Close sources"
          onClick={onClose}
          className="group grid size-4 cursor-pointer place-items-center rounded-full border border-gray-2 bg-gray-2"
        >
          <CrossLargeIcon
            svgClasses="size-3"
            pathClasses="stroke-typography-primary"
          />
        </button>
      </div>

      <div className="flex max-h-[360px] flex-col gap-3 overflow-y-auto pr-1 [scrollbar-width:thin] [&::-webkit-scrollbar]:w-[2px] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-2">
        {sources.length === 0 ? (
          <Text variant="caption" color="secondary">
            No sources for this answer.
          </Text>
        ) : (
          sources.map((item) => (
            <ChatSourcesPopupItem key={item.id} source={item} />
          ))
        )}
      </div>
    </div>
  );
}

function ChatSourcesPopupItem({ source }: { source: ChatSource }) {
  return (
    <a
      href={toExternalHref(source.url)}
      target="_blank"
      rel="noreferrer noopener"
      className="group flex flex-col gap-0.5"
    >
      <div className="flex items-center gap-1">
        <ChatSourceFavicon source={source} />
        <div className="flex min-w-0 flex-col">
          <Text
            className="truncate"
            variant="small"
            color="primary"
            title={source.source}
          >
            {source.source}
          </Text>
          <Text
            className="truncate"
            variant="small"
            color="secondary"
            title={source.url}
          >
            {source.url.replace(/^https?:\/\//, "")}
          </Text>
        </div>
      </div>
      <Text
        className="line-clamp-3 group-hover:underline"
        variant="label"
        color="primary"
      >
        {source.title}
      </Text>
    </a>
  );
}

function ChatSourceFavicon({ source }: { source: ChatSource }) {
  if (source.image_url) {
    return (
      <img
        src={source.image_url}
        alt=""
        className="h-5 w-4 shrink-0 object-contain"
        loading="lazy"
      />
    );
  }

  return (
    <div className="grid h-5 w-4 shrink-0 place-items-center">
      <span className="size-3 rounded-sm bg-gray-2" aria-hidden />
    </div>
  );
}
