import {
  CallableRequest,
//  HttpsError,
  onCall,
} from 'firebase-functions/v2/https';
import {
  FieldValue,
  Firestore,
  getFirestore,
} from 'firebase-admin/firestore';
import {logUserCommunityRemove} from '@/log/user';
import {removeCustomClaim} from '@/user/customClaim/remove';
import {
  requireAuthed,
  validateSchema
} from '@/common';
import {z} from 'zod';

export const remove = onCall(async (
  request: CallableRequest<any>
) => {
  requireAuthed(request.auth);
  validateSchema({
    data: request.data,
    schema: z.object({
      communityId: z.string()
    })
  });
  const userId: string = request.auth!.uid;
  const communityId: string = request.data.communityId;
  const firestore: Firestore = getFirestore();
  const tasks: Promise<any>[] = [
    firestore.collection('users')
    .doc(userId)
    .update({[`private.communities.community-${communityId}`]: FieldValue.delete()}),
    removeCustomClaim({
      id: userId,
      key: `community-${communityId}`,
    })
  ];
  if(!process.env.FUNCTIONS_EMULATOR){
    tasks.push(logUserCommunityRemove({
      communityId: `community-${communityId}`,
      ipAddress: request.rawRequest.ip,
      userId,
    }));
  }
  await tasks;
});
