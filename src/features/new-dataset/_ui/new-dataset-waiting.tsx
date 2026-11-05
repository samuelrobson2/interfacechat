import loadingBlackAnimation from "@/shared/assets/lottie/loading-black.json";
import { Text } from "@/shared/ui/kit/text";
import Lottie from "lottie-react";

export function NewDatasetWaiting() {
  return (
    <div className="max-w-[580px] mx-auto flex flex-col h-screen w-full items-center justify-center text-center">
      <Lottie
        className="size-30"
        animationData={loadingBlackAnimation}
        loop={true}
      />

      <Text className="mt-14" variant="h1">
        Getting your data ready
      </Text>
      <Text className="mt-4" color="secondary">
        We’re analyzing your file and generating metadata to ensure everything
        is displayed correctly on the next step.
      </Text>
    </div>
  );
}
