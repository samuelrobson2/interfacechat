import loadingBlackAnimation from "@/shared/assets/lottie/loading-black.json";
import Lottie from "lottie-react";

function GoogleCallbackPage() {
  return (
    <div className="flex items-center justify-center min-h-screen w-full">
      <Lottie
        className="size-20"
        animationData={loadingBlackAnimation}
        loop={true}
      />
    </div>
  );
}

export const Component = GoogleCallbackPage;
