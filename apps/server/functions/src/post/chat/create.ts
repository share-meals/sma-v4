import {
  CallableRequest,
  HttpsError,
  onCall,
} from 'firebase-functions/v2/https';
import {
  FieldValue,
  getFirestore,
} from 'firebase-admin/firestore';
import {getDatabase} from 'firebase-admin/database';
import {getMessaging} from 'firebase-admin/messaging';
import {logPostChatCreate} from '@/log';
import {postChatCreateSchema} from '@sma-v4/schema';
import {
  requireAdminOrMemberOf,
  requireAuthed,
  validateSchema
} from '@/common';

interface SendNewPostChatMessage {
  uids: string[],
  title: string,
  body: string,
  postId: string
}

const sendNewPostChatMessage = async ({
  uids,
  title,
  body,
  postId
}: SendNewPostChatMessage) => {
  // first get the messaging tokens
  const database = getDatabase();
  const tasks: any[] = [];
  for(const uid of uids){
    const messagingToken = await database.ref(`/messagingTokens/${uid}`).once('value');
    if(messagingToken.exists()){
      for(const token of Object.keys(messagingToken.val())){
	tasks.push(
	  getMessaging()
	  .send({
	    token,
	    data: {
	      source: 'event',
	      id: postId,
	    },
	    notification: {
	      body,
	      title
	    }
	  })
	  .catch(async (error: any) => {
	    switch(error.errorInfo.code){
	      case 'messaging/invalid-argument':
		// bad messaging token
		// so delete it.
		await database.ref(`/messagingTokens/${uid}/${token}`).remove();
		break;
	      default:
		// todo: something
		break;
	    }
	  })
	);
      }
    }
  }
  await Promise.all(tasks);
}

// todo: create zod typings
interface ChatDashboardItem {
  postId: string;
  text: string,
  title: string,
  timestamp: Date,
  type: string,
  unreadCount?: any,
  userId: string,
}

export const create = onCall(
  async (request: CallableRequest<any>) => {
    requireAuthed(request.auth);
    validateSchema({
      data: request.data,
      schema: postChatCreateSchema
    });

    // get post
    const firestore = getFirestore();
    const post = await firestore.collection('posts').doc(request.data.postId).get();
    if(!post.exists){
      throw new HttpsError('not-found', 'not-found');
    }

    const {uid: userId} = request.auth!;
    const data = post.data();
    await requireAdminOrMemberOf({
      communities: data!.communities,
      userId
    });

    const tasks: Promise<any>[] = [];
    const now = new Date();
    
    // get all subscribers
    const database = getDatabase();
    const subscribersReference = await database.ref(`/subscriptions/post-users/${request.data.postId}`).once('value');
    const subscribers: string[] =
      subscribersReference.exists()
      ? Object.keys({...subscribersReference.val(), [userId]: true})
      : [userId];

    let chatDashboardUpdates: {[key: string]: any} = {};
    for(const subscriber of subscribers){
      // update subscribers' dashboards
      let update: ChatDashboardItem = {
	postId: request.data.postId,
	text: request.data.text,
	title: data!.title,
	timestamp: now,
	type: 'event',
	userId
      };
      if(userId !== subscriber){
	update.unreadCount = FieldValue.increment(1);
      }
      chatDashboardUpdates[`${subscriber}/${request.data.postId}`] = update;
    }
    tasks.push(
      database.ref('chatDashboard')
      .update(chatDashboardUpdates)
    );

    tasks.push(
      sendNewPostChatMessage({
	uids: subscribers,
	title: data!.title,
	body: request.data.text,
	postId: request.data.postId
      })
    );
    
    tasks.push(
      firestore.collection('chats')
      .doc(request.data.postId)
      .set(
	{
	  messages: FieldValue.arrayUnion({
	    text: request.data.text,
	    timestamp: now,
	    userId: userId
	  })
	}, {
	  merge: true
	}
      )
    );
    
    if(!process.env.FUNCTIONS_EMULATOR){
      tasks.push(logPostChatCreate({
	communities: data!.communities,
	ipAddress: request.rawRequest.ip,
	postId: request.data.postId,
	text: request.data.text,
	userId,
      }));
    }
    
    await Promise.all(tasks);
  }
);
