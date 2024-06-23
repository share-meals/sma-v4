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
    const userId: string = request.auth!.uid!;
    const tasks: Promise<InsertRowsResponse | void>[] = [
      // log it
      logSmartPantryVend({
	itemNumber: itemNumber,
	itemPrice: itemPrice,
	machineId: machineId,
	status: 'denied',
	userId
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
