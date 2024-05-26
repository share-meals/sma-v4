import {
  CallableRequest,
  HttpsError,
  onCall,
} from 'firebase-functions/v2/https';
import {getFirestore} from 'firebase-admin/firestore';
import {logUserAction} from '@/log';
import {postActionSchema} from '@sma-v4/schema';
import {
  requireAdminOf,
  requireAuthed,
  validateSchema
} from '@/common';


export const feature = onCall(
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

    const {uid: user_id} = request.auth!;
    const data = post.data();
    await requireAdminOf({
      communities: data!.communities,
      user_id,
    });
    if(data!.user_id !== data!.user_id){
      // is not owner
      throw new HttpsError('unauthenticated', 'unauthenticated');
    }

    return Promise.all([
      firestore.collection('posts')
      .doc(request.data.id)
      .update({feature: request.data.value}),
      logUserAction({
	action: request.data.value ? 'post feature' : 'post unfeature',
	communities: data!.communities,
	ip_address: request.rawRequest.ip ?? '',
	payload: request.data.id,
	user_id,
      }),
    ]);
});
