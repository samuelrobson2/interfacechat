import Lottie from "lottie-react";
import loadingBlackAnimation from "@/shared/assets/lottie/loading-black.json";
import { Text } from "@/shared/ui/kit/text";

export function FinetuneHyperparametersLoader() {
  return (
    <div className="max-w-[580px] mx-auto flex flex-col h-screen w-full items-center justify-center text-center">
      <Lottie
        className="size-30"
        animationData={loadingBlackAnimation}
        loop={true}
      />

      <Text className="mt-14" variant="h1">
        Preparing the best recipe for your
        <br />
        training success
      </Text>
      <Text className="mt-4" color="secondary">
        We are analyzing your adaptive data and setting the training parameters
        to maximize success.
      </Text>
    </div>
  );
}
