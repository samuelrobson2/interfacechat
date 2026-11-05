import { NavLink, Outlet } from "react-router-dom";
import { TooltipProvider } from "@/shared/ui/kit";
import { Text } from "@/shared/ui/kit/text";
import { cn } from "@/shared/lib/css";
import { ROUTES } from "@/shared/model/routes";

// The UI Kit gallery shell: a header + a sub-nav that switches between the
// gallery pages (grouped by component type), with the active page rendered in
// the Outlet. Reachable from the sidebar "UI Kit" item.

const TABS: { to: string; label: string; end?: boolean }[] = [
  { to: ROUTES.UI_KIT, label: "Primitives", end: true },
  { to: ROUTES.UI_KIT_COMPONENTS, label: "Components" },
  { to: ROUTES.UI_KIT_ICONS, label: "Icons" },
  { to: ROUTES.UI_KIT_ANIMATED_ICONS, label: "Animated Icons" },
  { to: ROUTES.UI_KIT_COLORS, label: "Colors" },
  { to: ROUTES.UI_KIT_3D_IMAGES, label: "3D Images" },
  { to: ROUTES.UI_KIT_ADDITIONS, label: "Additions" },
];

function UiKitLayout() {
  return (
    <TooltipProvider>
      <div className="h-dvh w-full overflow-y-auto bg-background-primary md:h-screen">
        <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-8 px-6 py-10 md:px-10 md:py-14">
          <header className="flex flex-col gap-2">
            <Text variant="h1" as="h1" className="max-md:text-[32px]">
              UI Kit
            </Text>
            <Text variant="body" color="secondary">
              Every component in the app, shown live with the exact name and
              import path — a reference for building screens or prompting an
              agent to use, adjust, or reuse a component.
            </Text>
          </header>

          {/* Sub-nav — switches between the type-grouped gallery pages. */}
          <nav className="flex flex-wrap items-center gap-2">
            {TABS.map((tab) => (
              <NavLink
                key={tab.to}
                to={tab.to}
                end={tab.end}
                className={({ isActive }) =>
                  cn(
                    "flex h-9 items-center rounded-full px-4 font-bureau text-[14px] font-light transition-colors",
                    isActive
                      ? "bg-background-primary-inverse text-typography-inverse"
                      : "bg-gray-6 text-typography-secondary hover:text-typography-primary",
                  )
                }
              >
                {tab.label}
              </NavLink>
            ))}
          </nav>

          <Outlet />
        </div>
      </div>
    </TooltipProvider>
  );
}

export const Component = UiKitLayout;
