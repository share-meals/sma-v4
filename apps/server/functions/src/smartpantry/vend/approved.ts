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
import {logSmartPantryVend} from '@/log/smartpantry';

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
    console.log(JSON.stringify(request.data));
    try {
      logSmartPantryVend({
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
	'private.smartPantry.points': FieldValue.increment(itemPrice * -1)
      }),
      // log it
      /*
      logSmartPantryVend({
	itemNumber: itemNumber,
	itemPrice: itemPrice,
	machineId: machineId,
	status: 'approved',
	userId: userId
      }),
      */
      // send message to user
      database.ref(`/smsp/${machineId}/outbox`).set({
	message: 'approved',
	sessionId,
	timestamp: ServerValue.TIMESTAMP
      }),
      // tell machine to reset
      /*
      database.ref(`/smsp/${machineId}/inbox`).set({
	message: 'reset',
	timestamp: ServerValue.TIMESTAMP
      })
      */
    ]);
});
