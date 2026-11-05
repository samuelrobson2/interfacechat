import { Link } from "react-router-dom";
import {
  ChatGrayFrame,
  chatCategoryLightBgVariants,
  getChatCategoryColor,
  getChatCategoryIcon,
  getChatCategoryLabel,
  isChatCategory,
} from "@/services/chat";
import { cn } from "@/shared/lib/css";
import { Text } from "@/shared/ui/kit/text";

export function InterfaceCard({
  to,
  title,
  category,
  className,
}: {
  to: string;
  title: string;
  category?: string | null;
  className?: string;
}) {
  const resolvedCategory = isChatCategory(category) ? category : "uncategorized";
  const color = getChatCategoryColor(resolvedCategory);
  const icon = getChatCategoryIcon(resolvedCategory);
  const iconAlt = getChatCategoryLabel(resolvedCategory);

  return (
    <Link
      to={to}
      aria-label={title}
      className={cn(
        "group flex flex-col items-center gap-3 text-center outline-none",
        className,
      )}
    >
      <div className="w-full px-3 md:px-4">
        <ChatGrayFrame
          fillClassName={chatCategoryLightBgVariants({ color })}
          className="flex aspect-square w-full items-center justify-center p-4"
        >
          <img
            src={icon}
            alt={iconAlt}
            className="w-[68%] max-w-[80px] object-contain"
          />
        </ChatGrayFrame>
      </div>

      <Text
        as="span"
        variant="label"
        title={title}
        className="block w-full truncate rounded-[24px] bg-transparent px-2 py-0.5 transition-colors duration-150 group-hover:bg-gray-2/50"
      >
        {title}
      </Text>
    </Link>
  );
}
