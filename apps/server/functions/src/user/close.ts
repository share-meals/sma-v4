import {
  CallableRequest,
  onCall,
} from 'firebase-functions/v2/https';
import {getAuth} from 'firebase-admin/auth';
import {getDatabase} from 'firebase-admin/database';
import {getFirestore} from 'firebase-admin/firestore';
import {requireAuthed} from '@/common';

export const close = onCall(
  async (request: CallableRequest<any>) => {
    requireAuthed(request.auth);
    const auth = request.auth!;

    const tasks = [
      getAuth().deleteUser(auth.uid),
      getDatabase().ref(`/`).update({
	[`/chatDashboard/${auth.uid}`]: null,
	[`/messagingTokens/${auth.uid}`]: null,
	[`/subscriptions/user-posts/${auth.uid}`]: null,
	// TODO: pull from user-posts first, then generate paths in post-users to clear
	//[`/subscriptions/post-users/TODO/${auth.uid}`]: null,
      }),
      getFirestore().collection(`users`).doc(auth.uid).delete()
    ];
    await Promise.all(tasks);
});
