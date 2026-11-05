import { PlusIcon } from "@/shared/assets/icons/general/Plus";
import loadingBlackAnimation from "@/shared/assets/lottie/loading-black.json";
import { cn } from "@/shared/lib/css";
import { textVariants } from "@/shared/ui/kit/text";
import Lottie from "lottie-react";
import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { FolderArt } from "./chat-folder-card";

const PLACEHOLDER = "New custom folder";

type NewFolderStatus = "editing" | "loading";

function FolderBody({ children }: { children: ReactNode }) {
  return (
    <div className="flex size-full flex-col justify-between p-4">
      {children}
      <div className="flex items-center justify-end">
        <PlusIcon svgClasses="size-4 shrink-0" />
      </div>
    </div>
  );
}

export function ChatNewFolderCard({
  onCreate,
  className,
}: {
  onCreate?: (name: string) => void;
  className?: string;
}) {
  const [status, setStatus] = useState<NewFolderStatus>("editing");
  const [name, setName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleCancel = () => {
    setStatus("editing");
    setName("");
  };

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setStatus("loading");
    onCreate?.(trimmed);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSubmit();
      return;
    }
    if (event.key === "Escape") handleCancel();
  };

  const handleBlur = () => {
    if (!name.trim()) handleCancel();
  };

  return (
    <FolderArt
      className={cn(
        "flex w-[153px] flex-col items-center gap-3",
        className,
      )}
      folderIconClassName="text-[#F4F4F4]"
      parentBackgroundClassName="bg-gray-2"
      childBackgroundClassName="bg-gray-1"
    >
      {status === "loading" ? (
        <div className="flex size-full items-center justify-center">
          <Lottie
            className="size-15"
            animationData={loadingBlackAnimation}
            loop
          />
        </div>
      ) : (
        <FolderBody>
          <input
            ref={inputRef}
            value={name}
            onChange={(event) => setName(event.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            placeholder={PLACEHOLDER}
            aria-label="New folder name"
            className={cn(
              textVariants({ variant: "label", color: "primary" }),
              "w-full bg-transparent outline-none",
              "placeholder:text-typography-secondary",
            )}
          />
        </FolderBody>
      )}
    </FolderArt>
  );
}
