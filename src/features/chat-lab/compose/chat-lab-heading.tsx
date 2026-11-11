import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TrashIcon } from "@/shared/assets/icons/general/Trash";
import { ROUTES } from "@/shared/model/routes";
import { ChatHeadingMenuItem, ChatHeadingTitle } from "../pharos/chat";
import { disposeChatLabChat } from "../model/chat-lab-runtime";
import { cleanTitle, useChatLabStore } from "../model/chat-lab-store";

/** The thread's name and picture, centred in the workbench's top bar. Click the name to rename or delete. */
export function ChatLabTitle({ sessionId }: { sessionId: string }) {
  const navigate = useNavigate();
  const title = useChatLabStore((state) => state.sessions[sessionId]?.title);
  const renameSession = useChatLabStore((state) => state.renameSession);
  const deleteSession = useChatLabStore((state) => state.deleteSession);
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  const handleRename = (value: string) => {
    renameSession(sessionId, value);
    setIsEditingTitle(false);
  };

  const handleDelete = () => {
    disposeChatLabChat(sessionId);
    deleteSession(sessionId);
    navigate(ROUTES.CHAT_LAB);
  };

  return (
    <>
      <img
        src={`https://picsum.photos/seed/chat-${sessionId}/96/96`}
        alt=""
        className="size-8 shrink-0 rounded-full object-cover"
      />
      <ChatHeadingTitle
        title={cleanTitle(title ?? "") || "Untitled chat"}
        renameLabel="Rename chat"
        isEditing={isEditingTitle}
        onStartEditing={() => setIsEditingTitle(true)}
        onRename={handleRename}
        onCancel={() => setIsEditingTitle(false)}
      >
        <ChatHeadingMenuItem onSelect={handleDelete}>
          <TrashIcon svgClasses="size-4 shrink-0" pathClasses="stroke-icon-primary" />
          Delete chat
        </ChatHeadingMenuItem>
      </ChatHeadingTitle>
    </>
  );
}
