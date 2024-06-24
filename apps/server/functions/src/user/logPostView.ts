import {
  CallableRequest,
  onCall,
} from 'firebase-functions/v2/https';
import {
  Firestore,
  getFirestore,
} from 'firebase-admin/firestore';
import {logPostView as log} from '@/log';
import {
  requireAuthed,
  validateSchema
} from '@/common';
import {z} from 'zod';

export const logPostView = onCall(
  async (request: CallableRequest<any>) => {
    validateSchema({
      data: request.data,
      // todo: should this be centralized?
      schema: z.object({
	id: z.string()
      })
    });
    requireAuthed(request.auth);
    const {uid} = request.auth!;
    const firestore: Firestore = getFirestore();
    const postRef = await firestore.collection('posts').doc(request.data.id).get();
    if(postRef.exists){
      await log({
	communities: postRef.data()!.communities,
	ip_address: request.rawRequest.ip,
	post_id: request.data.id,
	user_id: uid,
      });
    }
});
