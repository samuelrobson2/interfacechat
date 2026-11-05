import { Outlet } from "react-router-dom";
import { TooltipProvider } from "@/shared/ui/kit";

// Shell for the "Common UI Examples" gallery. Deliberately unopinionated about
// padding/scrolling — the index list page and each example page own their own
// layout (an example like Document Analyser needs the full viewport).

function CommonUiExamplesLayout() {
  return (
    <TooltipProvider>
      <div className="h-dvh w-full overflow-hidden bg-background-primary md:h-screen">
        <Outlet />
      </div>
    </TooltipProvider>
  );
}

export const Component = CommonUiExamplesLayout;
