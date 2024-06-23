import {
  CallableRequest,
  onCall,
} from 'firebase-functions/v2/https';
import {getDatabase} from 'firebase-admin/database';
import {logMessagingTokenAction} from '@/log';
import {messagingTokenCreateSchema} from '@sma-v4/schema';
import {requireAuthed} from '@/common';
import {validateSchema} from '@/common';

export const create = onCall(
  async (request: CallableRequest<any>) => {
    // need to convert messagingTokenSchema to object
    validateSchema({
      data: request.data,
      schema: messagingTokenCreateSchema,
    });
    requireAuthed(request.auth);

    const now = new Date();
    const uid = request.auth!.uid;
    const database = getDatabase();
    const tasks: Promise<any>[] = [
      database.ref(`/messagingTokens/${uid}/${request.data.messagingToken}`).set({
	token: request.data.messagingToken,
	platform: request.data.platform,
	created: now,
	lastValidated: now
      })
    ];
    if(!process.env.FUNCTIONS_EMULATOR){
      tasks.push(logMessagingTokenAction({
	action: 'create',
	ipAddress: request.rawRequest.ip,
	platform: request.data.platform,
	uid,
      }));
    }
    await Promise.all(tasks);
});
