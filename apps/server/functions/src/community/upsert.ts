import {
  CallableRequest,
  HttpsError,
  onCall,
} from "firebase-functions/v2/https";
import {
  communitySchema,
  functionsErrorCodes,
} from "@sma-v4/schema";
import {getFirestore} from "firebase-admin/firestore";

module.exports = onCall(async (request: CallableRequest<any>) => {
  // todo: need to require SMAdmin
  const schema = communitySchema.pick({

  });
  try {
    schema.parse(request.data);
  } catch (error: any) {
    throw new HttpsError(
        "invalid-argument",
        functionsErrorCodes.invalidArgumentSchema
    );
  }

  // normalize codes and domains

  const firestore = getFirestore();
  console.log(firestore);
});
