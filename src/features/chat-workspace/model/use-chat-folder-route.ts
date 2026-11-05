import { useParams } from "react-router-dom";
import {
  getChatCategoryColor,
  getChatCategoryIcon,
  getChatCategoryLabel,
  isChatCategory,
  type ChatCategoryColor,
} from "@/services/chat";
import { ROUTES, type PathParams } from "@/shared/model/routes";

export type ChatFolderRouteInfo = {
  /** Directory id from the URL — passed straight to the sessions API as `directory_id`. */
  directoryId: string;
  title: string;
  color: ChatCategoryColor;
  icon?: string;
};

export function useChatFolderRoute(): ChatFolderRouteInfo {
  const { folder_id = "" } =
    useParams<PathParams[typeof ROUTES.CHAT_FOLDER]>();

  if (isChatCategory(folder_id)) {
    return {
      directoryId: folder_id,
      title: getChatCategoryLabel(folder_id),
      color: getChatCategoryColor(folder_id),
      icon: getChatCategoryIcon(folder_id),
    };
  }

  return {
    directoryId: folder_id,
    title: folder_id,
    color: "uncategorized",
  };
}
