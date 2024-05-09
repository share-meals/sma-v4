// internal

import {
  CollectionReference,
  DocumentData,
  Firestore,
  getFirestore,
  QuerySnapshot,
} from 'firebase-admin/firestore';
import {communityCodeSchema} from '@sma-v4/schema';
import {z} from 'zod';


export interface findCommunityByCommunityCodeProps {
  communityCode: z.infer<typeof communityCodeSchema>
}

export const findCommunityByCommunityCode = async ({
  communityCode
}: findCommunityByCommunityCodeProps) => {
  const firestore: Firestore = getFirestore();
  const communitiesCollection: CollectionReference<DocumentData> = firestore.collection('communities');
  const matchedCommunityQueries: Promise<QuerySnapshot<DocumentData>[]> = Promise.all([
    communitiesCollection.where('codes.member', 'array-contains', communityCode.toLowerCase() || ['NULL']).get(),
    communitiesCollection.where('codes.admin', 'array-contains', communityCode.toLowerCase() || ['NULL']).get(),
  ]);
  const matchedCommunitySnapshots: QuerySnapshot<DocumentData>[] = await matchedCommunityQueries;
  const payload = matchedCommunitySnapshots.map((match, index) => {
    return match.docs.map((doc) => {
      return {
	code: communityCode,
	communityId: doc.id,
	level: index === 0 ? 'member' : 'admin'
      };
    });
  });
  return payload.flat();
};
