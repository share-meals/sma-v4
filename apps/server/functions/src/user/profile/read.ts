import admin from 'firebase-admin';
import {UserRecord} from 'firebase-admin/auth';
import {
  CallableRequest,
  onCall,
} from 'firebase-functions/v2/https';
import {
  requireAuthed,
//  validateSchema // todo: validate schema
} from '@/common';

export const read = onCall(
  async(request: CallableRequest<any>) => {
    requireAuthed(request.auth);
    /*
    validateSchema({
      data: request.data,
      schema: 
    });
    */
    const {uid, displayName, photoURL}: UserRecord = await admin.auth().getUser(request.data.uid);
    return {
      uid,
      displayName,
      photoURL
    };
});
