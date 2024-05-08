import {addUserToCommunity} from './addUserToCommunity';
import {
  CallableRequest,
  HttpsError,
  onCall,
} from 'firebase-functions/v2/https';
import {communityCodeSchema} from '@sma-v4/schema';
import {findByCommunityCode} from './findByCommunityCode';
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
  const matchedCommunities = await findByCommunityCode({communityCode: request.data.communityCode});
  if(matchedCommunities.length === 0){
    throw new HttpsError(
      'invalid-argument',
      'no matched communities'
    );
  }
  const tasks = matchedCommunities.map((community) => {
    return addUserToCommunity({
      userId: request.auth!.uid,
      code: community.code,
      communityId: `community-${community.communityId}`,
			      level: <'admin' | 'member'> community.level // todo: pull admin | member from schema
    });
  });
  await Promise.all(tasks);
});
