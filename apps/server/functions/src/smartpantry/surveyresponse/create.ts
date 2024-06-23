import {
  CallableRequest,
  //  HttpsError,
  onCall,
} from 'firebase-functions/v2/https';
import {
  FieldValue,
  Firestore,
  getFirestore,
  WriteResult,
} from 'firebase-admin/firestore';
import {InsertRowsResponse} from '@google-cloud/bigquery';
import {logSmartPantrySurveyResponse} from '@/log/smartpantry';

export const create = onCall(
    async (request: CallableRequest<any>) => {
    // todo: lookup points
    // todo: validate
      const firestore: Firestore = getFirestore();
      const tasks: Promise<InsertRowsResponse | WriteResult>[] = [
        logSmartPantrySurveyResponse({
          surveyId: request.data.surveyId,
          responseJson: JSON.stringify(request.data.responses),
          userId: request.auth!.uid, // todo: validate
          machineId: request.data.machineId,
        }),
        firestore.collection('users').doc(request.auth!.uid).set({
          private: {
	  smartPantry: {
	    points: FieldValue.increment(
	      10 * 100
	    ),
	    timestamp: new Date(),
	  },
          },
        }, {merge: true}),
      ];
      Object.freeze(tasks);

      await Promise.all(tasks);
    });
