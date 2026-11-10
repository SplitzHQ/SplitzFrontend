/** Returns the address that a person opens to join a group with the join link `linkId`. */
export function groupJoinUrl(linkId: string): string {
  return `${globalThis.location.origin}/group/join/${linkId}`;
}
