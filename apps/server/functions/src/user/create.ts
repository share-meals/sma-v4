import {addUserToCommunity} from './community/addUserToCommunity';
import {
  CallableRequest,
  HttpsError,
  onCall,
} from 'firebase-functions/v2/https';
import {createDummyCommunity} from '@/community/createDummyCommunity';
import {findCommunityByCommunityCode} from '@/community/findCommunityByCommunityCode';
import {findCommunityByEmailDomain} from '@/community/findCommunityByEmailDomain';
import {
  Firestore,
  getFirestore,
} from 'firebase-admin/firestore';
import {
  functionsErrorCodes,
  languageType,
  signupSchema,
} from '@sma-v4/schema';
import {
  getAuth,
  UserRecord,
} from 'firebase-admin/auth';
import {InsertRowsResponse} from '@google-cloud/bigquery';
import {logUserCreate} from '@/log';
import {validateSchema} from '@/common';
import {z} from 'zod';

const legit = require('legit');

interface CommunityMatch {
  code: string,
  communityId: any,
  level: string,
}

const mergeCommunityMatches = (matches1: CommunityMatch[], matches2: CommunityMatch[]) => {
  // will prefer items from matches2 over matches1
  const map = new Map();
  matches1.forEach(obj => {
    map.set(obj.communityId, obj);
  });
  matches2.forEach(obj => {
    map.set(obj.communityId, obj);
  });
  return Array.from(map.values());
}

export const create = onCall(
  async (request: CallableRequest<any>) => {
    validateSchema({
      data: request.data,
      schema: signupSchema
    });

    if (!process.env.FUNCTIONS_EMULATOR && !(await legit(request.data.email))) {
      throw new HttpsError(
        'invalid-argument',
        functionsErrorCodes.invalidArgumentEmailDomain
      );
    }

    const firestore: Firestore = getFirestore();

    // --------------------------------
				 
				 // get any matched communities
    const emailDomain: string = request.data.email.split('@')[1];

    const matchedCommunitiesByEmailDomain = await findCommunityByEmailDomain({emailDomain});
    const matchedCommunitiesByCommunityCode = await findCommunityByCommunityCode({communityCode: request.data.communityCode});
    const matchedCommunities = mergeCommunityMatches(matchedCommunitiesByEmailDomain, matchedCommunitiesByCommunityCode);

    if(matchedCommunities.length === 0){
      // no matched communities at all
      if (request.data.email.endsWith('edu')) {
        // only create a dummy community if user has an edu email address
        const dummyCommunityId: string = await createDummyCommunity(emailDomain);
        matchedCommunities.push({code: emailDomain, communityId: dummyCommunityId, level: 'member'});
      }else{
	throw new HttpsError(
	  'invalid-argument',
	  'no matched communities'
	);
      }
    }

    
    // try to create user
    const auth = getAuth();
    let userRecord: UserRecord;
    try {
      userRecord = await auth.createUser({
        disabled: false,
        displayName: request.data.name,
        email: request.data.email,
        emailVerified: false,
        password: request.data.password,
      });
    } catch (error: any) {
      switch (error.code) {
        case 'auth/email-already-exists':
	  throw new HttpsError(
	    'already-exists',
	    error.code
	  );
	  break;
        default:
	  throw new HttpsError(
	    'unknown',
	    error.code
	  );
	  break;
      }
    }
    const userLanguage: z.infer<typeof languageType> = request.data.language || 'en'; // default to English

    // create user record
    await firestore.collection('users').doc(userRecord.uid).set({
      private: {
        language: userLanguage,
      },
    });

    const tasks: Promise<InsertRowsResponse | void>[] = [];

    matchedCommunities.forEach((t) => {
      tasks.push(
        ...addUserToCommunity({
	  userId: userRecord.uid,
	  code: t.code,
	  communityId: `community-${t.communityId}`,
			      level: t.level,
        })
      );
    });

    if(!process.env.FUNCTIONS_EMULATOR){
      tasks.push(
	logUserCreate({
          emailDomain,
          ipAddress: request.rawRequest.ip,
          userId: userRecord.uid,
	})
      );
    }
    
    /*
       tasks.push(
       addCustomClaim({
       id: userRecord.uid,
       key: 'language',
       value: userLanguage,
       }),
       );
     */
    Object.freeze(tasks);
    // todo: this hangs in the emulator
    await Promise.all(tasks);
});
