// internal

import {
  CollectionReference,
  DocumentData,
  Firestore,
  getFirestore,
  QuerySnapshot,
} from 'firebase-admin/firestore';

// todo: convert to zod
export interface findCommunityByEmailDomainProps {
  emailDomain: string
}

export const findCommunityByEmailDomain = async ({
  emailDomain
}: findCommunityByEmailDomainProps) => {
  const firestore: Firestore = getFirestore();
  const communitiesCollection: CollectionReference<DocumentData> = firestore.collection('communities');
  const matchedCommunityQuery: Promise<QuerySnapshot<DocumentData>> = communitiesCollection.where('domains', 'array-contains', emailDomain.toLowerCase() || ['NULL']).get();
  const matchedCommunitySnapshot: QuerySnapshot<DocumentData> = await matchedCommunityQuery;
  return matchedCommunitySnapshot.docs.map((doc) => {
    return {
      code: emailDomain,
      communityId: doc.id,
      communityName: doc.data().name,
      level: 'member'
    };
  });
};
