// TODO: type return to match SmartPantryInfo

import {
  CallableRequest,
  HttpsError,
  onCall,
} from "firebase-functions/v2/https";
import {getFirestore} from 'firebase-admin/firestore';
import {functionsErrorCodes} from '@sma-v4/schema';
import {
  requireAuthed,
  validateSchema
} from '@/common';
import {z} from 'zod';

const smartpantryInfoSchema = z.object({
  spid: z.string()
});

export const info = onCall(
  async (request: CallableRequest<any>) => {
    requireAuthed(request.auth);
    validateSchema({
      data: request.data,
      schema: smartpantryInfoSchema
    });

    const firestore = getFirestore();
    const sp = await firestore
    .collection('smartPantries')
    .doc(
      request.data.spid
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, '')
    )
    .get();
    if(!sp.exists){
      throw new HttpsError(
	'invalid-argument',
	functionsErrorCodes.invalidArgumentSchema
      );
    }
    return sp.data();
  }
);
