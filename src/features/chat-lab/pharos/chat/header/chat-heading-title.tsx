import { useState } from "react";
import { PencilEditIcon } from "@/shared/assets/icons/general/PencilEdit";
import { ChevronBottomIcon } from "@/shared/assets/icons/outlined/ChevronBottom";
import { cn } from "@/shared/lib/css";
import { Text } from "@/shared/ui/kit/text";
import {
  ChatDropdownMenu,
  ChatDropdownMenuContent,
  ChatDropdownMenuItem,
  ChatDropdownMenuTrigger,
} from "../_ui/chat-dropdown-menu";
import { ChatTitleInput } from "./chat-title-input";

const titleButtonClasses =
  "group flex cursor-pointer items-center gap-2";

function ChatHeadingTitleLabel({ title }: { title: string }) {
  return (
    <>
      <Text
        variant="label"
        weight="regular"
        as="span"
        className="whitespace-pre"
      >
        {title || "\u00a0"}
      </Text>
      <ChevronBottomIcon
        svgClasses={cn(
          "size-4 shrink-0 transition-transform duration-300",
          "group-data-[state=open]:rotate-180",
        )}
        pathClasses="stroke-icon-primary"
      />
    </>
  );
}

function ChatHeadingTitleField({
  title,
  onSave,
  onCancel,
}: {
  title: string;
  onSave: (value: string) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState(title);

  return (
    <div className="relative min-w-0">
      {/* Live sizer: starts at the current title width, then grows with the draft. */}
      <div
        aria-hidden
        className={cn(titleButtonClasses, "pointer-events-none invisible")}
      >
        <ChatHeadingTitleLabel title={value} />
      </div>
      <ChatTitleInput
        value={value}
        onValueChange={setValue}
        onSave={onSave}
        onCancel={onCancel}
        className="absolute inset-0 size-full max-w-none"
      />
    </div>
  );
}

export function ChatHeadingMenuItem({
  className,
  ...props
}: React.ComponentProps<typeof ChatDropdownMenuItem>) {
  return (
    <ChatDropdownMenuItem
      className={cn(
        "items-center gap-2 px-1.5 py-1 whitespace-nowrap",
        className,
      )}
      {...props}
    />
  );
}

export function ChatHeadingTitle({
  title,
  renameLabel,
  isEditing,
  onStartEditing,
  onRename,
  onCancel,
  children,
}: {
  title: string;
  renameLabel: string;
  isEditing: boolean;
  onStartEditing: () => void;
  onRename: (value: string) => void;
  onCancel: () => void;
  children?: React.ReactNode;
}) {
  if (isEditing) {
    return (
      <ChatHeadingTitleField
        title={title}
        onSave={onRename}
        onCancel={onCancel}
      />
    );
  }

  return (
    <ChatDropdownMenu>
      <ChatDropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Toggle heading actions"
          className={titleButtonClasses}
        >
          <ChatHeadingTitleLabel title={title} />
        </button>
      </ChatDropdownMenuTrigger>
      <ChatDropdownMenuContent
        appearance="card"
        align="center"
        sideOffset={6}
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        <ChatHeadingMenuItem onSelect={onStartEditing}>
          <PencilEditIcon
            svgClasses="size-4 shrink-0"
            pathClasses="stroke-icon-primary"
          />
          {renameLabel}
        </ChatHeadingMenuItem>
        {children}
      </ChatDropdownMenuContent>
    </ChatDropdownMenu>
  );
}
