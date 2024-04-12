import {close} from './close';
import {
  Request,
//  Response,
  onRequest,
} from 'firebase-functions/v2/https';
import {
  getFirestore,
} from 'firebase-admin/firestore';
import {onSchedule} from 'firebase-functions/v2/scheduler';

const cullFunction = async () => {
  const firestore = getFirestore();
  const stalePosts = await firestore.collection('posts').where('ends', '<', new Date()).get();
  if(!stalePosts.empty){
    const tasks: Promise<any>[] = [];
    stalePosts.forEach((post) => {
      tasks.push(close(post.id));
    });
    await Promise.all(tasks);
  }
}

export const cullTriggered = onRequest(
  async (request: Request) => {
    await cullFunction();
  }
);

export const cullScheduled = onSchedule(
  '2,17,31,47 * * * *',
  async (event) => {
    await cullFunction();
});
