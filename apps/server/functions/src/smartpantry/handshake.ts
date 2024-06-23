import {
  CallableRequest,
  HttpsError,
  onCall,
} from "firebase-functions/v2/https";
import {
//  CollectionReference,
//  DocumentData,
  Firestore,
  getFirestore,
//  QuerySnapshot,
} from "firebase-admin/firestore";

const surveyJSON = {
  meta: {
    id: 20240214,
  },
  pages: [
    [
      // page 1
      {
        module: "text",
        text: `# Hunter College Smart Pantry

This is explainer text`,
      },
      {
        // question 1
        module: "question",
        name: "screener1",
        type: "multipleChoice",
        text: `We worried whether our food would run out before we got money to buy more.  
In the last 12 months, this statement was:`,
        options: [
          "Often True",
          "Sometimes True",
          "Never True",
          "Don't Know",
        ],
        maxSelections: 1,
        required: true,
      },
      {
      // question 1
        module: "question",
        name: "screener2",
        type: "multipleChoice",
        text: `The food we bought just didn't last and we didn't have money to get more.  
In the last 12 months, this statement was:`,
        options: [
          "Often True",
          "Sometimes True",
          "Never True",
          "Don't Know",
        ],
        maxSelections: 1,
        required: true,
      },
    ],
  ],
};

export const handshake = onCall(
    async (request: CallableRequest<any>) => {
    // todo: validation
      const firestore: Firestore = getFirestore();
      if (request.auth === undefined) {
        throw new HttpsError(
            "already-exists",
            "TODO fill out"
        );
      }
      const userRecord = (await firestore.collection("users").doc(request.auth.uid).get()).data();
      if (userRecord === undefined) {
        throw new HttpsError(
            "already-exists",
            "TODO fill out"
        );
      }

      if (userRecord.smartPantry === undefined) {
        return {
          step: "survey",
          surveyJSON,
        };
      } else {
        return {
          step: "points",
          points: 10,
        };
      }
    });
