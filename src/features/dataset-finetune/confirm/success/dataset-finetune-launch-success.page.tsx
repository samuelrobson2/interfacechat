import { Link } from "react-router-dom";
import { useSessionStore } from "@/services/auth";
import bigClockImage from "@/shared/assets/images/big-clock.png";
import { ROUTES } from "@/shared/model/routes";
import { Button } from "@/shared/ui/kit/button";
import { Text } from "@/shared/ui/kit/text";

function DatasetFinetuneLaunchSuccessPage() {
  const user = useSessionStore((state) => state.user);

  return (
    <div className="w-full h-screen pt-25 gap-12 flex flex-col items-center">
      <div className="flex flex-col items-center text-center">
        <img src={bigClockImage} alt="Launch started" />
        <Text className="mt-10" variant="h1">
          {user?.profile?.name}, your model training is cooking
        </Text>
        <Text className="mt-4" color="secondary">
          We will email you as soon as your model is ready.
        </Text>
        <Button className="mt-10" asChild>
          <Link to={ROUTES.DATASETS}>View My Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}

export const Component = DatasetFinetuneLaunchSuccessPage;
