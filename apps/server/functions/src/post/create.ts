import {
  CallableRequest,
  HttpsError,
  onCall,
} from 'firebase-functions/v2/https';
import {
  FieldPath,
  Firestore,
  getFirestore,
} from 'firebase-admin/firestore';
import {getDatabase} from 'firebase-admin/database';
import {getMessaging} from 'firebase-admin/messaging';
import {logPostCreate} from '@/log';
import {postCreateServerSchema} from '@sma-v4/schema';
import {
  requireAuthed,
  validateSchema
} from '@/common';

interface SendNewPostMessage {
  communities: string[],
  id: string,
  title: string,
  body: string
}

const sendNewPostMessage = async ({
  communities,
  id, // unfixed
  title,
  body
}: SendNewPostMessage) => {
  const condition: string = communities
  .map((c: string) => `'community-${c}' in topics`)
  .join(' || ');
  return getMessaging()
  .send({
    condition,
    data: {
      source: 'post',
      id
    },
    notification: {
      title,
      body
    }
  })
  .catch((error: any) => {
    console.log(error);
  });
}

export const create = onCall(
  async (request: CallableRequest<any>) => {
    validateSchema({
      data: request.data,
      schema: postCreateServerSchema
    });
    requireAuthed(request.auth);
    
    // validate that user has correct permissions to post to the communities
    const firestore: Firestore = getFirestore();
    const communityRecords = await firestore.collection('communities')
    .where(FieldPath.documentId(), 'in', request.data.communities)
    .get();
    
    const userTokens = request.auth!.token;
    communityRecords.forEach((snapshot) => {
      const data = snapshot.data();
      const id = `community-${snapshot.id}`;
      if(
	// required admin but is not
	(data.features.canPost
      && data.features.mustWhitelistPost
      && userTokens[id] !== 'admin')
	|| !userTokens[id] // not member at all
	|| !data.features.canPost // cannot post to community at all
      ){
	throw new HttpsError('permission-denied', 'permission-denied');
      }
    });

    const {id} = firestore.collection('posts').doc();
    const {uid} = request.auth!;


    const tasks: Promise<any>[] = [
      // add new post to firestore 
      firestore.collection('posts').doc(id).set({
	...request.data,
	user_id: uid,
	// convert starts and ends to dates so we can use firestore TTL
	starts: new Date(request.data.starts),
	ends: new Date(request.data.ends)
      }),
      // send messages
      sendNewPostMessage({
	communities: request.data.communities,
	id,
	title: request.data.title,
	body: request.data.location.name || request.data.location.address
      })
    ];

    const database = getDatabase();

    // add initial subscriptions
    tasks.push(
      database.ref(`/subscriptions/user-posts/${uid}`).set({[id]: true})
    )
    tasks.push(
      database.ref(`/subscriptions/post-users/${id}`).set({[uid]: true})
    )

    if(!process.env.FUNCTIONS_EMULATOR){
      // log new post
      tasks.push(logPostCreate({
	ip_address: request.rawRequest.ip,
	post_id: id,
	user_id: uid,
	...request.data
      }));
    }
    
    // todo: need to upload any photos
    await Promise.all(tasks);
});
