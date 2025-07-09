import {
  CallableRequest,
  onCall,
} from 'firebase-functions/v2/https';
import {
  Database,
  getDatabase,
  ServerValue,
} from 'firebase-admin/database';
const {error} = require('firebase-functions/logger');
import {
  FieldValue,
  Firestore,
  getFirestore,
} from 'firebase-admin/firestore';
import {logPantryLinkVend} from '@/log/pantryLink';

export const approved = onCall(
  async (request: CallableRequest<any>) => {
    // todo: validation
    const firestore: Firestore = getFirestore();
    const database: Database = getDatabase();
    const {
      itemPrice,
      itemNumber,
      machineId,
      sessionId,
      userId,
    } = request.data;
    try {
      logPantryLinkVend({
	item_number: itemNumber,
	item_price: itemPrice,
	machine_id: machineId,
	status: 'approved',
	user_id: userId
      })

    }catch(e){
      error(e);
    }
    return Promise.all([
      // deduct points
      firestore.collection('users').doc(userId).update({
	// todo: just in case, check if points goes below 0
	'private.pantryLink.points': FieldValue.increment(itemPrice * -1)
      }),
      // send message to user
      database.ref(`/pantryLinks/${machineId}/outbox`).set({
	message: 'approved',
	sessionId,
	timestamp: ServerValue.TIMESTAMP
      }),
      // tell machine to reset
      /*
      database.ref(`/pantryLinks/${machineId}/inbox`).set({
	message: 'reset',
	timestamp: ServerValue.TIMESTAMP
      })
      */
    ]);
});
