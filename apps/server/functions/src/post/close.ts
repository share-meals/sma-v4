import {getDatabase} from 'firebase-admin/database';
import {getFirestore} from 'firebase-admin/firestore';

export async function close(id: string){
  const database = getDatabase();
  const firestore = getFirestore();
  const postReference = firestore.collection('posts').doc(id);
  const post = await postReference.get();
  if(!post.exists){
    return;
  }
  const tasks: Promise<any>[] = [];

  
  // todo: delete photos
  // todo: delete chats


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

  // delete the post
  tasks.push(postReference.delete());

  // roll it all together
  await Promise.all(tasks);
}
