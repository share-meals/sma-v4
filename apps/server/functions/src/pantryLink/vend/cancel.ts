import {
  CallableRequest,
  onCall,
} from 'firebase-functions/v2/https';
import {
  Database,
  getDatabase,
  ServerValue,
} from 'firebase-admin/database';
import {logPantryLinkVend} from '@/log/pantryLink';

export const cancel = onCall(
  async (request: CallableRequest<any>) => {
    // todo: validation
    const {machineId} = request.data;
    const database: Database = getDatabase();
    return Promise.all([
      database.ref(`/pantryLinks/${machineId}/inbox`).set({
	message: 'cancelRequest',
	timestamp: ServerValue.TIMESTAMP
      }),
      database.ref(`/pantryLinks/${machineId}/outbox`).remove(),
      logPantryLinkVend({
	machine_id: machineId,
	status: 'canceled',
	user_id: request.auth!.uid!
      })
    ]);
});
