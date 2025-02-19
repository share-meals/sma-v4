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

export const submit = onCall(
  async (request: CallableRequest<any>) => {
    // todo: lookup points
    // todo: validate
    const firestore: Firestore = getFirestore();
    let tasks: Promise<InsertRowsResponse | WriteResult>[] = [
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
    if (process.env.FUNCTIONS_EMULATOR) {
      // emulator
      tasks.push(
	logSmartPantrySurveyResponse({
          survey_id: request.data.surveyId,
          response_json: JSON.stringify(request.data.responseJson),
          user_id: request.auth!.uid, // todo: validate
          machine_id: request.data.machineId,
	})
      );
    }
    await Promise.all(tasks);
});
