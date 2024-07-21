import {getDatabase} from 'firebase-admin/database';
import {getFirestore} from 'firebase-admin/firestore';
import {getStorage} from 'firebase-admin/storage';

export async function internalClose(id: string){
  const database = getDatabase();
  const firestore = getFirestore();
  const postReference = firestore.collection('posts').doc(id);
  const post = await postReference.get();
  if(!post.exists){
    return;
  }
  const tasks: Promise<any>[] = [];
  
  const data = post.data();
  
  // clean up photos
  if(data!.photos){
    for(const photo of data!.photos){
      tasks.push(
	getStorage().bucket().file(`postPhotos/${id}-${photo}.png`).delete()
      );
    }
  }

  const chatReference = firestore.collection('chats').doc(id);

  // clean up all subscriptions
  const subscribers = (await database.ref(`/subscriptions/post-users/${id}`)
  .once('value')).val();
  if(subscribers){
    const updates: {[key: string]: null} = {};
    for(const subscriberId of Object.keys(subscribers)){
      updates[`/subscriptions/user-posts/${subscriberId}/${id}`] = null;
    }
    updates[`/subscriptions/post-users/${id}`] = null;
    tasks.push(database.ref().update(updates));
  }

  tasks.push(postReference.delete());
  tasks.push(chatReference.delete());
  
  // roll it all together
  return Promise.all(tasks);
}
