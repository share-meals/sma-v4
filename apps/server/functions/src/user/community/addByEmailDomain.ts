import {addUserToCommunity} from './addUserToCommunity';
import admin from 'firebase-admin';
import {
  CallableRequest,
  HttpsError,
  onCall,
} from 'firebase-functions/v2/https';
import {findCommunityByEmailDomain} from '@/community/findCommunityByEmailDomain';
import {requireAuthed} from '@/common';

export const addByEmailDomain = onCall(async (
  request: CallableRequest<any>
) => {
  requireAuthed(request.auth);
  const matchedCommunities = await findCommunityByEmailDomain({emailDomain: request.auth!.token.email!.split('@')[1]});
  if(matchedCommunities.length === 0){
    throw new HttpsError(
      'invalid-argument',
      'no matched communities'
    );
  }
  const {customClaims: customClaimsRaw} = await admin.auth().getUser(request.auth!.uid);
  const customClaims = customClaimsRaw ?? {};
  const filteredCommunities = matchedCommunities.filter((c) => (!customClaims[`community-${c.communityId}`]));
  if(filteredCommunities.length === 0){
    throw new HttpsError(
      'already-exists',
      'no new communities to join'
    );
  }
  const tasks = filteredCommunities.map((community) => {
    return addUserToCommunity({
      code: community.code,
      communityId: `community-${community.communityId}`,
      ipAddress: request.rawRequest.ip,
      level: <'admin' | 'member'> community.level, // todo: pull admin | member from schema
      userId: request.auth!.uid,
    });
  });
  await Promise.all(tasks);
  return filteredCommunities;
});
