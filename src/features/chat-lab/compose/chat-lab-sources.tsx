import { CrossLargeIcon } from "@/shared/assets/icons/outlined/CrossLarge";
import { cn } from "@/shared/lib/css";
import { Text } from "@/shared/ui/kit/text";

export type ChatSource = {
  id: string;
  title: string;
  url: string;
  source: string;
  image_url?: string;
};

const toExternalHref = (url: string) =>
  /^https?:\/\//i.test(url) ? url : `https://${url}`;

/** Pharos `ChatSourcesPopup`, from chat on main, dev, and staging. */
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
            <a
              key={item.id}
              href={toExternalHref(item.url)}
              target="_blank"
              rel="noreferrer noopener"
              className="group flex flex-col gap-0.5"
            >
              <Text className="truncate" variant="small" color="secondary">
                {item.source}
              </Text>
              <Text
                className="line-clamp-3 group-hover:underline"
                variant="label"
                color="primary"
              >
                {item.title}
              </Text>
            </a>
          ))
        )}
      </div>
    </div>
  );
}
