import type { FriendDto, GroupDto } from "@/backend";

export type UserListItem = UserListItemFriend | UserListItemGroup;

export interface UserListItemFriend extends FriendDto {
  __typename: "UserListItemFriend";
  id: string;
}

export interface UserListItemGroup extends GroupDto {
  __typename: "UserListItemGroup";
  id: string;
}
