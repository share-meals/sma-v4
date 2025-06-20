export type JoinCommunityErrorMessage = 'no new communities to join' | 'no matched communities';

export interface JoinCommunitySuccessMessage {
  code: string,
  communityId: string,
  communityName: string,
  level: 'admin' | 'member'
}

