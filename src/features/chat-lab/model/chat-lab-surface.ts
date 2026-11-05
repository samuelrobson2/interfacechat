import { href } from "react-router-dom";
import { ROUTES } from "@/shared/model/routes";

export type ChatLabSurface = "chat" | "chat-2";

export const chatLabHome = () => ROUTES.CHAT_LAB;

export const chatLabSessionPath = (chatId: string) =>
  href(ROUTES.CHAT_LAB_SESSION, { chat_id: chatId });

/** Strips the composer card so the field reads as text on the page. */
export const PLAIN_COMPOSER_CLASS = [
  "[&_[data-slot=surface-frame]]:bg-transparent",
  "[&_[data-slot=surface-frame]]:shadow-none",
  "[&_[data-slot=surface-frame]]:![--hairline-color:transparent]",
  "[&_[data-slot=prompt-input]]:bg-transparent",
  "[&_[data-slot=prompt-input]]:shadow-none",
  "[&_[data-slot=prompt-input]]:![--hairline-color:transparent]",
  "[&_[data-slot=surface-frame-stroke]]:hidden",
].join(" ");
