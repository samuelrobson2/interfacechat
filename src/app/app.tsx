import { Toaster } from "@/shared/ui/kit/sonner-toast";
import { ExportRealtimeListener } from "@/services/dataset";
import { Outlet } from "react-router-dom";

export function App() {
  return (
    <main className="font-bureau relative">
      <Outlet />
      <ExportRealtimeListener />
      <Toaster />
    </main>
  );
}
