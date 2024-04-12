import {addUserToCommunity} from './community/add';
import {
  CallableRequest,
  HttpsError,
  onCall,
} from 'firebase-functions/v2/https';
import {
  CollectionReference,
  DocumentData,
  Firestore,
  getFirestore,
  QuerySnapshot,
} from 'firebase-admin/firestore';
import {createDummyCommunity} from '@/community/createDummyCommunity';
import {
  functionsErrorCodes,
  languageType,
  userSchema,
} from '@sma-v4/schema';
import {
  getAuth,
  UserRecord,
} from 'firebase-admin/auth';
import {InsertRowsResponse} from '@google-cloud/bigquery';
import {logUserCreate} from '@/log';
import {z} from 'zod';

const legit = require('legit');

export const verifySchema = (data: {[key: string]: any}): boolean => {
  const schema = userSchema.pick({
    email: true,
    name: true,
    password: true,
    language: true,
  })
  .partial({
    language: true, // todo: make this required
  });

  return schema.safeParse(data).success;
};

export const create = onCall(
  async (request: CallableRequest<any>) => {
    if (!verifySchema(request.data)) {
      throw new HttpsError(
        'invalid-argument',
        functionsErrorCodes.invalidArgumentSchema
      );
    }

    if (!process.env.FUNCTIONS_EMULATOR && !(await legit(request.data.email))) {
      throw new HttpsError(
        'invalid-argument',
        functionsErrorCodes.invalidArgumentEmailDomain
      );
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

    const firestore: Firestore = getFirestore();

    // create user record
    await firestore.collection('users').doc(userRecord.uid).set({
      private: {
        language: userLanguage,
      },
    });

    // get any matche dcommunities
    const emailDomain: string = request.data.email.split('@')[1];
    const communitiesCollection: CollectionReference<DocumentData> = firestore.collection('communities');
    const matchedCommunityQueries: Promise<QuerySnapshot<DocumentData>[]> = Promise.all([
      communitiesCollection.where('domains', 'array-contains', emailDomain).get(),
      communitiesCollection.where('codes.member', 'array-contains', request.data.codes || ['NULL']).get(),
      communitiesCollection.where('codes.admin', 'array-contains', request.data.codes || ['NULL']).get(),
    ]);

    const matchedCommunitySnapshots: QuerySnapshot<DocumentData>[] = await matchedCommunityQueries;

    // use an object so no duplicates are stored
    // and admin codes will overwrite other tasks
    type addCommunityTaskPayload = {
      code: string,
      communityId: string,
      level: 'admin' | 'member',
    };
    const addCommunityTasks: {[key: string]: addCommunityTaskPayload} = {};
    if (matchedCommunitySnapshots.reduce((sum, snapshot) => sum + snapshot.size, 0) === 0) {
      // no matched communities at all

      if (request.data.email.endsWith('edu')) {
        // only create a dummy community if user has an edu email address
        const dummyCommunityId: string = await createDummyCommunity(emailDomain);
        addCommunityTasks[dummyCommunityId] = {code: emailDomain, communityId: dummyCommunityId, level: 'member'};
      }
    } else {
      // at least one community is matched, so need to find which ones
      matchedCommunitySnapshots.forEach((match, index) => {
        match.docs
        .forEach((doc) => {
	  switch (index) {
	    case 0:
	      addCommunityTasks[doc.id] = {code: emailDomain, communityId: doc.id, level: 'member'};
	      break;
	    case 1:
	      // todo: find intersection of codes
	      addCommunityTasks[doc.id] = {code: request.data.codes.join(','), communityId: doc.id, level: 'member'};
	      break;
	    case 2:
	      // todo: find intersection of codes
	      addCommunityTasks[doc.id] = {code: request.data.codes.join(','), communityId: doc.id, level: 'admin'};
	      break;
	  }
        });
      });
    }
    Object.freeze(addCommunityTasks);

    const tasks: Promise<InsertRowsResponse | void>[] = [];

    Object.values(addCommunityTasks)
    .forEach((t) => {
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
