import {
  CallableRequest,
  HttpsError,
  onCall,
} from 'firebase-functions/v2/https';
import {
  Database,
  getDatabase
} from 'firebase-admin/database';
import {
  Firestore,
  getFirestore,
} from 'firebase-admin/firestore';
import {
  ChatMessage,
  shareAskSchema
} from '@sma-v4/schema';
import {
  requireAuthed,
  validateSchema
} from '@/common';

const findIntersectionWithPrefix = (
  baseArray: string[],
  prefixedArray: string[],
  prefix: string = 'community-') => {
  const allPossibleValues = new Set([
    ...prefixedArray,
    ...prefixedArray.map(item => 
      item.startsWith(prefix) ? item.slice(prefix.length) : prefix + item
    )
  ]);
  
  return baseArray.filter(item => allPossibleValues.has(item));
}

const normalizeUids = (uid1: string, uid2: string) => {
  return [uid1, uid2].sort().join('-');
}

export const ask = onCall(
  async (request: CallableRequest<any>) => {
    requireAuthed(request.auth);
    validateSchema({
      data: request.data,
      schema: shareAskSchema
    });

    const firestore: Firestore = getFirestore();
    const postSnap = await firestore.collection('posts')
    .doc(request.data.postId)
    .get();

    if(!postSnap.exists){
      throw new HttpsError('not-found', 'not-found');
    }

    const post = postSnap.data();

    const sharedCommunities = findIntersectionWithPrefix(
      Object.keys(request.auth!.token).filter((c) => c.startsWith('community-')),
      post!.communities);

    if(sharedCommunities.length === 0){
      // TODO: better error message
      throw new HttpsError('unauthenticated', 'unauthenticated');
    }

    const uid: string = request.auth!.uid;
    
    const database: Database = getDatabase();
    const didTheyAskRef = database.ref(`/shares/${request.data.postId}/asks/${uid}`);
    const didTheyAsk = (await didTheyAskRef.once('value')).val();
    if(didTheyAsk !== null){
      // TODO: better error message
      throw new HttpsError('unauthenticated', 'unauthenticated');
    }
    
    let tasks: Promise<any>[] = [];

    // TODO: verify that user is not blocked
    const chatId: string = `chat-${normalizeUids(uid, post!.userId)}`;

    const message: ChatMessage = {
	chatId,
	text: request.data.message,
	userId: uid,
	shareAskId: request.data.postId,
	shareAskStatus: 'pending',
	timestamp: new Date()
    }
    
    tasks.push(
      firestore
      .collection('messages')
      .add(message)
    );

    tasks.push(
      database.ref(`/shares/${request.data.postId}/asks/${uid}`).set('pending')
    );

    
    
    await Promise.all(tasks);
    
    // open chat between 2
    // update chatDashboard
    // send push notifications
});
