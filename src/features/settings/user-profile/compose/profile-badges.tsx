import { useSessionStore } from "@/services/auth";
import { getDomainColorizedIcon } from "@/services/dataset";
import type { ApiSchemas } from "@/shared/api/schema";
import { settingsQueryOptions } from "@/services/settings";
import { CardHeader } from "@/shared/ui/kit/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/shared/ui/kit/carousel";
import { Text } from "@/shared/ui/kit/text";
import { useQuery } from "@tanstack/react-query";
import { ProfileBadgesCard } from "../ui/profile-badges-card";
import { ProfileBadgesEmptyState } from "../ui/profile-badges-empty-state";
import { Separator } from "@/shared/ui/kit/separator";

export type BadgeItem = {
  id: string;
  domain: string;
  title: string;
  date: string;
  icon: string;
};

function mapBadge(badge: ApiSchemas["UserBadgeDto"]): BadgeItem {
  return {
    id: badge.id,
    domain: badge.domain.name,
    title: badge.domain.name,
    date: new Date(badge.unlocked_at).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }),
    icon: getDomainColorizedIcon(badge.domain.code),
  };
}

export function ProfileBadges() {
  const userId = useSessionStore((state) => state.user?.user_id);
  const { data } = useQuery({
    ...settingsQueryOptions.badges(userId!),
    enabled: Boolean(userId),
  });

  const badges = data?.badges.map(mapBadge) ?? [];

  if (badges.length === 0) return <ProfileBadgesEmptyState />;

  return (
    <>
      <Separator color="secondary" />
      {badges?.length > 0 ? (
        <>
          <Carousel
            opts={{
              align: "start",
              loop: false,
            }}
            className="flex flex-col gap-8"
          >
            <CardHeader className="justify-between">
              <Text variant="h2">Your badges</Text>

              <div className="flex gap-2">
                <CarouselPrevious className="static translate-y-0" />
                <CarouselNext className="static translate-y-0" />
              </div>
            </CardHeader>
            <CarouselContent className="-ml-7">
              {badges.map((badge, index) => (
                <CarouselItem
                  key={badge.id}
                  className="gap-[32px] basis-auto flex items-center"
                >
                  <ProfileBadgesCard badge={badge} />
                  {index !== badges.length - 1 && (
                    <Separator color="secondary" orientation="vertical" />
                  )}
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </>
      ) : (
        <ProfileBadgesEmptyState />
      )}
    </>
  );
}
