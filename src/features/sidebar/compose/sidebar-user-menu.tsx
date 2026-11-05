import { useLogout, useSessionStore } from "@/services/auth";
import { FeedbackFormDialog } from "@/services/settings";
import { DevDocsIcon } from "@/shared/assets/icons/general/DevDocs";
import { HelpIcon } from "@/shared/assets/icons/general/Help";
import { LogOutIcon } from "@/shared/assets/icons/general/LogOut";
import { PlansIcon } from "@/shared/assets/icons/general/Plans";
import { SettingsIcon } from "@/shared/assets/icons/general/Settings";
import { cn } from "@/shared/lib/css";
import { DEVELOPER_DOCS_LINK, ROUTES } from "@/shared/model/routes";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/kit/avatar";
import {
  SidebarCard,
  SidebarItem,
  SidebarItemLabel,
} from "@/shared/ui/kit/sidebar";
import { Skeleton } from "@/shared/ui/kit/skeleton";
import { Suspense } from "react";
import { Link } from "react-router-dom";

export function SidebarUserMenu({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const user = useSessionStore((state) => state.user);
  const { handleLogout, isPending } = useLogout();

  const userInfo = (
    <>
      <Avatar className="size-6 shrink-0">
        <AvatarImage
          src={user?.profile?.profile_photo ?? undefined}
          alt="User Avatar"
        />
        <AvatarFallback userName={user?.profile?.name} />
      </Avatar>
      <SidebarItemLabel>{user?.profile?.name}</SidebarItemLabel>
    </>
  );

  return (
    <SidebarCard
      onMouseEnter={() => onOpenChange(true)}
      onMouseLeave={() => onOpenChange(false)}
      className="p-1.5 gap-0"
    >
      <SidebarItem className="p-1.5 items-center" asChild>
        <Link to={ROUTES.USER_PROFILE}>{userInfo}</Link>
      </SidebarItem>

      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-200 ease-out h-fit",
          open ? "grid-rows-[1fr] mt-1.5" : "grid-rows-[0fr]",
        )}
      >
        <div className="flex w-full min-h-0 flex-col gap-1.5 overflow-hidden">
          <SidebarItem asChild>
            <Link to={ROUTES.PLANS}>
              <PlansIcon />
              <SidebarItemLabel>Billing</SidebarItemLabel>
            </Link>
          </SidebarItem>

          <SidebarItem asChild>
            <Link to={ROUTES.SETTINGS}>
              <SettingsIcon />
              <SidebarItemLabel>Settings</SidebarItemLabel>
            </Link>
          </SidebarItem>

          <SidebarItem asChild>
            <Link to={DEVELOPER_DOCS_LINK} target="_blank">
              <DevDocsIcon />
              <SidebarItemLabel>Developer Docs</SidebarItemLabel>
            </Link>
          </SidebarItem>

          <Suspense
            fallback={
              <div className="w-full p-2">
                <Skeleton className="h-5 w-full" />
              </div>
            }
          >
            <FeedbackFormDialog
              trigger={
                <SidebarItem>
                  <HelpIcon />
                  <SidebarItemLabel>Help</SidebarItemLabel>
                </SidebarItem>
              }
            />
          </Suspense>

          <SidebarItem asChild>
            <button type="button" onClick={handleLogout} disabled={isPending}>
              <LogOutIcon />
              <SidebarItemLabel>Log Out</SidebarItemLabel>
            </button>
          </SidebarItem>
        </div>
      </div>
    </SidebarCard>
  );
}
