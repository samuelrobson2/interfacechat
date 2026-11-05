export type { AnimatedIconProps } from "./types";
export { useIconActiveAnimation } from "./use-icon-active-animation";

export { BuildIconAnimated } from "./build-animated";
export { DashboardIconAnimated } from "./dashboard-animated";
export { ChatIconAnimated } from "./chat-animated";
export { ChatHistoryIconAnimated } from "./chat-history-animated";
export { AutoInterfaceIconAnimated } from "./auto-interface-animated";
export { LayoutIconAnimated } from "./layout-animated";
export { SlackIconAnimated } from "./slack-animated";
export { BuildMarkAnimated } from "./build-mark-animated";
export { StudioMarkAnimated } from "./studio-mark-animated";

import type { ComponentType } from "react";
import type { AnimatedIconProps } from "./types";
import { AutoInterfaceIconAnimated } from "./auto-interface-animated";
import { BuildIconAnimated } from "./build-animated";
import { BuildMarkAnimated } from "./build-mark-animated";
import { ChatHistoryIconAnimated } from "./chat-history-animated";
import { ChatIconAnimated } from "./chat-animated";
import { DashboardIconAnimated } from "./dashboard-animated";
import { LayoutIconAnimated } from "./layout-animated";
import { SlackIconAnimated } from "./slack-animated";
import { StudioMarkAnimated } from "./studio-mark-animated";

/** Sidebar icons with tab-activation animations, keyed by label. */
export const SIDEBAR_ANIMATED_ICONS = {
  Build: BuildIconAnimated,
  Dashboard: DashboardIconAnimated,
  "Chat": ChatIconAnimated,
  "Chat History": ChatHistoryIconAnimated,
  "auto-interface": AutoInterfaceIconAnimated,
  "UI Kit": LayoutIconAnimated,
  "Slack app": SlackIconAnimated,
} as const satisfies Record<string, ComponentType<AnimatedIconProps>>;

export type SidebarAnimatedIconId = keyof typeof SIDEBAR_ANIMATED_ICONS;

/** Build / Studio brand marks used in Vision and the mode switcher. */
export const BRAND_ANIMATED_ICONS = {
  Build: BuildMarkAnimated,
  Studio: StudioMarkAnimated,
} as const satisfies Record<string, ComponentType<AnimatedIconProps>>;

export type BrandAnimatedIconId = keyof typeof BRAND_ANIMATED_ICONS;
