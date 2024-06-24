import {
  CallableRequest,
  onCall,
} from 'firebase-functions/v2/https';
import {
  Database,
  getDatabase,
  ServerValue,
} from 'firebase-admin/database';
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
    const user_id: string = request.auth!.uid!;
    const tasks: Promise<InsertRowsResponse | void>[] = [
      // log it
      logSmartPantryVend({
	item_number: itemNumber,
	item_price: itemPrice,
	machine_id: machineId,
	status: 'denied',
	user_id
      }),
      // send message to user
      database.ref(`/smsp/${machineId}/outbox`).set({
	message: 'denied',
	sessionId,
	timestamp: ServerValue.TIMESTAMP
      })
    ];

    return Promise.all(tasks);
});
