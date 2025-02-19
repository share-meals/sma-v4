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
import {logSmartPantryVend} from '@/log/smartpantry';

export const denied = onCall(
  async (request: CallableRequest<any>) => {
    // todo: validation
    const database: Database = getDatabase();
    const {
      itemPrice,
      itemNumber,
      machineId,
      sessionId,
    } = request.data;
    const userId: string = request.auth!.uid!;
    try{
      await logSmartPantryVend({
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
      database.ref(`/smsp/${machineId}/outbox`).set({
	message: 'denied',
	sessionId,
	timestamp: ServerValue.TIMESTAMP
      })
    ];

    return Promise.all(tasks);
});
