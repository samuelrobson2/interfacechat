import { useLogout, useSessionStore } from "@/services/auth";
import { DevDocsIcon } from "@/shared/assets/icons/general/DevDocs";
import { LogOutIcon } from "@/shared/assets/icons/general/LogOut";
import { PlansIcon } from "@/shared/assets/icons/general/Plans";
import { SettingsIcon } from "@/shared/assets/icons/general/Settings";
import { cn } from "@/shared/lib/css";
import { DEVELOPER_DOCS_LINK, ROUTES } from "@/shared/model/routes";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/kit/avatar";
import { Text } from "@/shared/ui/kit/text";
import { ChevronUp } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";

const menuRowClassName =
  "flex w-full items-center gap-2.5 rounded-[12px] px-2 py-2 text-left transition-colors hover:bg-gray-6";

function MenuRow({
  icon,
  label,
  to,
  external,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  to?: string;
  external?: boolean;
  onClick?: () => void;
}) {
  const body = (
    <>
      {icon}
      <Text variant="label">{label}</Text>
    </>
  );
  if (to) {
    return (
      <Link
        to={to}
        {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
        className={menuRowClassName}
      >
        {body}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={menuRowClassName}>
      {body}
    </button>
  );
}

/**
 * The profile control at the bottom of the workspace panels. Clicking it grows
 * a small menu open in place — the same expand interaction the global menu uses
 * on hover — revealing the account details and actions (Billing, Settings,
 * Developer Docs, Log Out). Controlled so the panel can react (e.g. minimise
 * Recents to make room).
 */
export function SidebarProfileMenu({
  displayName,
  open,
  onOpenChange,
  expanded = true,
}: {
  displayName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /**
   * False in a hover-expanding rail: the row narrows to just the avatar, so the
   * name and chevron are dropped until the panel opens.
   */
  expanded?: boolean;
}) {
  const user = useSessionStore((state) => state.user);
  const { handleLogout, isPending } = useLogout();

  const photo = user?.profile?.profile_photo ?? undefined;

  return (
    <div className="flex w-full flex-col">
      {/* Grows open above the profile row. */}
      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="flex flex-col gap-0.5 pb-1.5">
            <MenuRow
              to={ROUTES.PLANS}
              icon={<PlansIcon svgClasses="size-5" />}
              label="Billing"
            />
            <MenuRow
              to={ROUTES.SETTINGS}
              icon={<SettingsIcon svgClasses="size-5" />}
              label="Settings"
            />
            <MenuRow
              to={DEVELOPER_DOCS_LINK}
              external
              icon={<DevDocsIcon svgClasses="size-5" />}
              label="Developer Docs"
            />
            <MenuRow
              icon={<LogOutIcon svgClasses="size-5" />}
              label="Log Out"
              onClick={() => !isPending && handleLogout()}
            />
          </div>
        </div>
      </div>

      {/* Trigger row */}
      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        aria-expanded={open}
        aria-label={expanded ? undefined : displayName}
        className={cn(
          "flex w-full items-center gap-2 rounded-[18px] p-2 text-left transition-colors hover:bg-gray-6",
          !expanded && "justify-center",
        )}
      >
        <Avatar className="size-7 shrink-0">
          <AvatarImage src={photo} alt="User avatar" />
          <AvatarFallback userName={displayName} />
        </Avatar>
        {expanded && (
          <>
            <Text variant="label" className="min-w-0 flex-1 truncate">
              {displayName}
            </Text>
            <ChevronUp
              className={cn(
                "size-4 shrink-0 text-gray-3 transition-transform",
                !open && "rotate-180",
              )}
            />
          </>
        )}
      </button>
    </div>
  );
}
