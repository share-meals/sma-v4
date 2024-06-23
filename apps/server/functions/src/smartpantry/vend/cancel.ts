import {
  CallableRequest,
  onCall,
} from 'firebase-functions/v2/https';
import {
  Database,
  getDatabase,
  ServerValue,
} from 'firebase-admin/database';
import {logSmartPantryVend} from '@/log/smartpantry';

export const cancel = onCall(
  async (request: CallableRequest<any>) => {
    // todo: validation
    const {machineId} = request.data;
    const database: Database = getDatabase();
    return Promise.all([
      database.ref(`/smsp/${machineId}/inbox`).set({
	message: 'cancelRequest',
	timestamp: ServerValue.TIMESTAMP
      }),
      database.ref(`/smsp/${machineId}/outbox`).remove(),
      logSmartPantryVend({
	machineId: machineId,
	status: 'canceled',
	userId: request.auth!.uid!
      })
    ]);
});
