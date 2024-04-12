import {
  CallableRequest,
  onCall,
} from "firebase-functions/v2/https";
import {
  fixedCommunityIdSchema,
  messagingTokenSchema,
} from '@sma-v4/schema';
import {getMessaging} from 'firebase-admin/messaging';
import {validateSchema} from '@/common';
import {z} from 'zod';

export const unsubscribe = onCall(async (
  request: CallableRequest<any>
) => {
  if (process.env.FUNCTIONS_EMULATOR) {
    // emulator
    return;
  }

  // need to convert messagingTokenSchema to object
  validateSchema({
    data: request.data,
    schema: z.object({
    messagingToken: messagingTokenSchema,
    communityIds: z.array(fixedCommunityIdSchema).nonempty()
    })
  });

  const tasks = [];
  for(const c of request.data.communityIds){
    tasks.push(getMessaging().unsubscribeFromTopic(request.data.messagingToken, c));
  }
  await Promise.all(tasks);
  return;
});
