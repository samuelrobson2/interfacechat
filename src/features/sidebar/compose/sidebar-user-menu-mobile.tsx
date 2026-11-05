import { useLogout, useSessionStore } from "@/services/auth";
import { FeedbackFormDialog } from "@/services/settings";
import { StarIcon } from "@/shared/assets/icons/general/Star";
import { LogoutIcon } from "@/shared/assets/icons/outlined/Logout";
import { DEVELOPER_DOCS_LINK } from "@/shared/model/routes";
import { Card } from "@/shared/ui/kit/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/kit/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/kit/dropdown-menu";
import { Skeleton } from "@/shared/ui/kit/skeleton";
import { Suspense } from "react";
import { Link } from "react-router-dom";
import { DevDocsIcon } from "@/shared/assets/icons/general/DevDocs";

export function SidebarUserMenuMobile() {
  const user = useSessionStore((state) => state.user);
  const { handleLogout, isPending } = useLogout();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Card className="items-center justify-center rounded-[136px] [--hairline-radius:136px] cursor-pointer p-1">
          <Avatar>
            <AvatarImage
              src={user?.profile?.profile_photo ?? undefined}
              alt="User Avatar"
            />
            <AvatarFallback userName={user?.profile?.name} />
          </Avatar>
        </Card>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-60"
        align="start"
        side="right"
        sideOffset={12}
      >
        <DropdownMenuGroup>
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link to={DEVELOPER_DOCS_LINK} target="_blank">
              <DevDocsIcon /> Developer Docs
            </Link>
          </DropdownMenuItem>
          <Suspense
            fallback={
              <div className="w-full px-3 py-2.5">
                <Skeleton className="w-full h-6" />
              </div>
            }
          >
            <FeedbackFormDialog
              trigger={
                <DropdownMenuItem
                  className="cursor-pointer"
                  onSelect={(event) => event.preventDefault()}
                >
                  <StarIcon pathClasses="stroke-icon-primary" /> Feedback
                </DropdownMenuItem>
              }
            />
          </Suspense>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleLogout}
            disabled={isPending}
            className="cursor-pointer"
          >
            <LogoutIcon pathClasses="stroke-icon-primary" /> Logout
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}