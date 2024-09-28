import {addUserToCommunity} from './addUserToCommunity';
import admin from 'firebase-admin';
import {
  CallableRequest,
  HttpsError,
  onCall,
} from 'firebase-functions/v2/https';
import {communityCodeSchema} from '@sma-v4/schema';
import {findCommunityByCommunityCode} from '@/community/findCommunityByCommunityCode';
import {
  requireAuthed,
  validateSchema
} from '@/common';
import {z} from 'zod';

export const addByCommunityCode = onCall(async (
  request: CallableRequest<any>
) => {
  requireAuthed(request.auth);
  validateSchema({
    data: request.data,
    schema: z.object({
      communityCode: communityCodeSchema
    })
  });
  const matchedCommunities = await findCommunityByCommunityCode({communityCode: request.data.communityCode});
  if(matchedCommunities.length === 0){
    throw new HttpsError(
      'invalid-argument',
      'no matched communities'
    );
  }
  const {customClaims: customClaimsRaw} = await admin.auth().getUser(request.auth!.uid);
  const customClaims = customClaimsRaw ?? {};
  const filteredCommunities = matchedCommunities.filter((c) => (
    !customClaims[`community-${c.communityId}`]
    || (c.level === 'admin' && customClaims[`community-${c.communityId}`] === 'member')
  ));
  
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
