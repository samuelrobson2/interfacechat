import gradientImage from "@/shared/assets/images/loading-gradient.svg";
import { Text } from "@/shared/ui/kit/text";

export function WelcomeOverlay() {
  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-background-primary">
      <div className="relative flex justify-center top-[227px]">
        <div className="z-1 items-center gap-2 text-center">
          <Text className="text-[64px]">Welcome back, Samuel</Text>
          <Text variant="h2">Getting things ready...</Text>
        </div>
      </div>
      <img
        src={gradientImage}
        alt=""
        className="absolute right-0 bottom-0 left-0 z-0 w-full"
      />
    </div>
  );
}
