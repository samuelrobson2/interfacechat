import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { ChevronRightIcon } from "lucide-react";
import { ChatGrayFrame } from "./chat-gray-frame";
import { cn } from "@/shared/lib/css";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuTrigger,
} from "@/shared/ui/kit/dropdown-menu";
import { textVariants } from "@/shared/ui/kit/text";

/**
 * Item styling reused across both menu surfaces. Exported so any caller can
 * extend / override it via `cn(chatDropdownMenuItemClasses, "text-destructive")`.
 */
export const chatDropdownMenuItemClasses = cn(
  textVariants({ variant: "label" }),
  "rounded-[8px] p-1 transition-colors duration-300 cursor-pointer",
  "hover:bg-gray-6 focus:bg-gray-6 items-start",
);

const ChatDropdownMenu = DropdownMenu;
const ChatDropdownMenuTrigger = DropdownMenuTrigger;
const ChatDropdownMenuSub = DropdownMenuSub;

type ChatDropdownMenuContentProps = React.ComponentProps<
  typeof DropdownMenuContent
> & {
  /** Width of the inner frame, e.g. "w-[160px]". Defaults to "w-[200px]". */
  frameClassName?: string;
};

function ChatDropdownMenuContent({
  className,
  frameClassName,
  sideOffset = 8,
  align = "end",
  children,
  ...props
}: ChatDropdownMenuContentProps) {
  return (
    <DropdownMenuContent
      className={cn("border-none", className)}
      asChild
      sideOffset={sideOffset}
      align={align}
      {...props}
    >
      <ChatGrayFrame
        overlay
        className={cn("w-[200px] rounded-[12px] p-3", frameClassName)}
      >
        <DropdownMenuGroup className="relative z-10 flex flex-col gap-1">
          {children}
        </DropdownMenuGroup>
      </ChatGrayFrame>
    </DropdownMenuContent>
  );
}

function ChatDropdownMenuItem({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuItem>) {
  return (
    <DropdownMenuItem
      className={cn(chatDropdownMenuItemClasses, className)}
      {...props}
    />
  );
}

function ChatDropdownMenuSubTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubTrigger>) {
  return (
    <DropdownMenuPrimitive.SubTrigger
      data-slot="chat-dropdown-menu-sub-trigger"
      className={cn(
        chatDropdownMenuItemClasses,
        "flex items-center gap-2 outline-hidden",
        "data-[state=open]:bg-gray-6",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto size-4 shrink-0" />
    </DropdownMenuPrimitive.SubTrigger>
  );
}

type ChatDropdownMenuSubContentProps = React.ComponentProps<
  typeof DropdownMenuPrimitive.SubContent
> & {
  /** Width of the inner frame, e.g. "w-[160px]". Defaults to "w-[220px]". */
  frameClassName?: string;
};

function ChatDropdownMenuSubContent({
  className,
  frameClassName,
  sideOffset = 18,
  alignOffset = -12,
  children,
  ...props
}: ChatDropdownMenuSubContentProps) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.SubContent
        data-slot="chat-dropdown-menu-sub-content"
        className={cn("z-50 border-none", className)}
        asChild
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        {...props}
      >
        <ChatGrayFrame
          overlay
          className={cn("w-[220px] rounded-[12px] p-3", frameClassName)}
        >
          <DropdownMenuGroup className="relative z-10 flex flex-col gap-1">
            {children}
          </DropdownMenuGroup>
        </ChatGrayFrame>
      </DropdownMenuPrimitive.SubContent>
    </DropdownMenuPrimitive.Portal>
  );
}

export {
  ChatDropdownMenu,
  ChatDropdownMenuTrigger,
  ChatDropdownMenuContent,
  ChatDropdownMenuItem,
  ChatDropdownMenuSub,
  ChatDropdownMenuSubTrigger,
  ChatDropdownMenuSubContent,
};
