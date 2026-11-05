import { ROUTES } from "@/shared/model/routes";
import { Button } from "@/shared/ui/kit/button";
import { Text } from "@/shared/ui/kit/text";
import { Link } from "react-router-dom";

export function ProfileBadgesEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center">
      <Text variant="h2">Your badges</Text>
      <Text className="mt-3 text-center">
        You have no badges yet. Create a new dataset
        <br />
        to earn your first badge!
      </Text>
      <Button variant="secondary" className="mt-8" asChild>
        <Link to={ROUTES.NEW_DATASET_ADAPT}>Create Dataset</Link>
      </Button>
    </div>
  );
}
