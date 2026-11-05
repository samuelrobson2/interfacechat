import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { TrashIcon } from "@/shared/assets/icons/general/Trash";
import { ROUTES } from "@/shared/model/routes";
import { ChatHeader, ChatHeadingMenuItem, ChatHeadingTitle } from "../pharos/chat";
import { userMessageSentEvent } from "../pharos/chat/conversation/lib/chat-scroll-events";
import { disposeChatLabChat } from "../model/chat-lab-runtime";
import {
  cleanTitle,
  listSessionArtefacts,
  useChatLabStore,
} from "../model/chat-lab-store";
import { ChatLabArtefactBadge } from "./chat-lab-artefact";
import { ChatLabToolbar } from "./chat-lab-toolbar";

/** Title stays centered. Toolbar icons sit on the page's right edge. */
export function ChatLabHeading({ sessionId }: { sessionId: string }) {
  const navigate = useNavigate();
  const session = useChatLabStore((state) => state.sessions[sessionId]);
  const artefacts = useMemo(() => listSessionArtefacts(session), [session]);
  const activeArtefactId = session?.activeArtefactId ?? null;
  const title = session?.title;
  const focusArtefact = useChatLabStore((state) => state.focusArtefact);
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

  const handleArtefactClick = (artefactId: string, sourceUserMessageId: string | null) => {
    focusArtefact(sessionId, artefactId);
    if (sourceUserMessageId) {
      userMessageSentEvent.emit(sourceUserMessageId);
    }
  };

  return (
    <>
      <ChatHeader>
        <div className="flex items-center gap-2.5">
          {artefacts.length > 0 && (
            <div className="flex items-center gap-1.5">
              {artefacts.map((artefact) => (
                <ChatLabArtefactBadge
                  key={artefact.id}
                  kind={artefact.kind}
                  shell={artefact.shell}
                  title={artefact.title}
                  active={artefact.id === activeArtefactId}
                  onClick={() =>
                    handleArtefactClick(
                      artefact.id,
                      artefact.sourceUserMessageId,
                    )
                  }
                />
              ))}
            </div>
          )}
          <ChatHeadingTitle
            title={cleanTitle(title ?? "") || "Untitled chat"}
            renameLabel="Rename chat"
            isEditing={isEditingTitle}
            onStartEditing={() => setIsEditingTitle(true)}
            onRename={handleRename}
            onCancel={() => setIsEditingTitle(false)}
          >
            <ChatHeadingMenuItem onSelect={handleDelete}>
              <TrashIcon
                svgClasses="size-4 shrink-0"
                pathClasses="stroke-icon-primary"
              />
              Delete chat
            </ChatHeadingMenuItem>
          </ChatHeadingTitle>
        </div>
      </ChatHeader>
      {createPortal(
        <div className="fixed top-0 right-4 z-40 flex h-[72px] items-center md:right-6 md:h-[52px]">
          <ChatLabToolbar />
        </div>,
        document.body,
      )}
    </>
  );
}
