import { Text } from "@/shared/ui/kit/text";
import type { BadgeItem } from "../compose/profile-badges";

export function ProfileBadgesCard({ badge }: { badge: BadgeItem }) {
  return (
    <div className="flex items-center h-full gap-[16px]">
      <img src={badge.icon} alt={badge.domain} className="size-20" />

      <div className="flex flex-col gap-[2px] w-[195px]">
        <Text>1st dataset </Text>

        <div className="flex flex-col gap-[6px]">
          <Text variant="title">{badge.title}</Text>
          <Text color="secondary">{badge.date}</Text>
        </div>
      </div>
    </div>
  );
}
