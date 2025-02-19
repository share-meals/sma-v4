import {
  CallableRequest,
  HttpsError,
  onCall,
} from 'firebase-functions/v2/https';
import {
  Database,
  getDatabase,
  ServerValue,
} from 'firebase-admin/database';
import {
  Firestore,
  getFirestore,
} from 'firebase-admin/firestore';
import {v4 as uuidv4} from 'uuid';

export const request = onCall(
    async (request: CallableRequest<any>) => {
      const firestore: Firestore = getFirestore();
      const database: Database = getDatabase();
      const userRecord = await firestore.collection('users').doc(request.auth!.uid!).get();
      const data = userRecord.data();
      // todo: check it exists
      const points: number = data?.private?.smartPantry?.points || 0;
      // check if points > 0
      if (points === 0) {
        throw new HttpsError(
            'invalid-argument', // todo: better
            'abc' // todo: better
        );
      }
      // todo: verify schema
      const machineId: string = request.data.machineId;
      const sessionId: string = uuidv4();
      await database.ref(`/smsp/${machineId}/inbox`).set({
        message: `addPoints:${sessionId}:${points}`,
	userId: request.auth!.uid!,
        timestamp: ServerValue.TIMESTAMP
      });
      return {sessionId};
});
