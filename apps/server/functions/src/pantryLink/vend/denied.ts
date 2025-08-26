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
import {InsertRowsResponse} from '@google-cloud/bigquery';
import {logPantryLinkVend} from '@/log/pantryLink';

export const denied = onCall(
  async (request: CallableRequest<any>) => {
    // todo: validation
    const database: Database = getDatabase();
    const {
      itemPrice,
      itemNumber,
      machineId,
      sessionId,
      userId
    } = request.data;
    try{
      await logPantryLinkVend({
	item_number: itemNumber,
	item_price: itemPrice,
	machine_id: machineId,
	status: 'denied',
	user_id: userId
      });
    }catch(e){
      error(JSON.stringify(e));
    }

    const tasks: Promise<InsertRowsResponse | void>[] = [
      // log it
      // send message to user
      database.ref(`/pantryLinks/${machineId}/outbox`).set({
	message: 'denied',
	sessionId,
	timestamp: ServerValue.TIMESTAMP
      })
    ];

    return Promise.all(tasks);
});
