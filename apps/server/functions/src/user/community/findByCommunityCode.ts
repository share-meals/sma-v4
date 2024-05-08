// internal

import {
  CollectionReference,
  DocumentData,
  Firestore,
  getFirestore,
  QuerySnapshot,
} from 'firebase-admin/firestore';

export interface findByCommunityCodeProps {
  communityCode: any
}

export const findByCommunityCode = async ({
  communityCode
}: findByCommunityCodeProps) => {
  const firestore: Firestore = getFirestore();
  const communitiesCollection: CollectionReference<DocumentData> = firestore.collection('communities');
  const matchedCommunityQueries: Promise<QuerySnapshot<DocumentData>[]> = Promise.all([
    communitiesCollection.where('codes.member', 'array-contains', communityCode || ['NULL']).get(),
    communitiesCollection.where('codes.admin', 'array-contains', communityCode || ['NULL']).get(),
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
