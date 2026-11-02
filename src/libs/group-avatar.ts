import type { GroupDto } from "@/backend";
import type { AvatarProps } from "@/components/Avatar/Avatar.vue";

/**
 * Images for a group avatar. Uses the group photo when it has one, otherwise up to four member photos.
 */
export function getGroupAvatarImages(group: GroupDto | undefined): AvatarProps["images"] {
  if (!group) return [];
  if (group.photo) {
    return [{ alt: group.name, src: group.photo }];
  }
  return group.members.slice(0, 4).map((m) => ({ alt: m.userName, src: m.photo ?? null }));
}
