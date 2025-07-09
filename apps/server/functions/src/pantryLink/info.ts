// TODO: type return to match PantryLinkInfo

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

const pantryLinkInfoSchema = z.object({
  plid: z.string()
});

export const info = onCall(
  async (request: CallableRequest<any>) => {
    requireAuthed(request.auth);
    validateSchema({
      data: request.data,
      schema: pantryLinkInfoSchema
    });

    const firestore = getFirestore();
    const pl = await firestore
    .collection('pantryLinks')
    .doc(
      request.data.plid
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, '')
    )
    .get();
    if(!pl.exists){
      throw new HttpsError(
	'invalid-argument',
	functionsErrorCodes.invalidArgumentSchema
      );
    }
    return pl.data();
  }
);
