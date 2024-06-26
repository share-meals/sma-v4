import {
  CallableRequest,
  HttpsError,
  onCall,
} from 'firebase-functions/v2/https';
import {getFirestore} from 'firebase-admin/firestore';
import {internalClose} from './internalClose';
import {
  isAdminOf,
  requireAuthed,
  validateSchema
} from '@/common';
import {logUserAction} from '@/log';
import {postActionSchema} from '@sma-v4/schema';

export const close = onCall(
  async (request: CallableRequest<any>) => {
    requireAuthed(request.auth);
    validateSchema({
      data: request.data,
      schema: postActionSchema
    });
    
    // get post
    const firestore = getFirestore();
    const post = await firestore.collection('posts').doc(request.data.id).get();
    if(!post.exists){
      throw new HttpsError('not-found', 'not-found');
    }

    const {uid: userId} = request.auth!;
    const data = post.data();
    const isAdmin = await isAdminOf({
      communities: data!.communities,
      userId,
    });
    const isOwner = data!.userId === userId;
    if(!isAdmin && !isOwner){
      throw new HttpsError('unauthenticated', 'unauthenticated');
    }
    await Promise.all([
      internalClose(request.data.id),
      logUserAction({
	action: 'post close',
	communities: data!.communities,
	ipAddress: request.rawRequest.ip ?? '',
	payload: request.data.id,
	userId,
      }),
    ]);
});
