import {
  collection,
  doc,
  documentId,
  where,
  Firestore,
  query
} from 'firebase/firestore';
import {
  createContext,
  useContext,
  useState,
} from 'react';
import {communitySchema} from '@/components/schema';
import {
  useFirestore,
  useFirestoreCollectionData,
  useFirestoreDocData,
} from 'reactfire';
import {useProfile} from '@/contexts/Profile';
import {z} from 'zod';

interface CommunitiesMap {
  [key: string]: z.infer<typeof communitySchema>
}

interface CommunitiesMapByFeature {
  canShare: CommunitiesMap,
  canPost: CommunitiesMap,
  canSmartPantry: CommunitiesMap,
  canNone: CommunitiesMap
}

export interface CommunitiesState {
  communities: CommunitiesMapByFeature,
  communityIds: string[]
}

const CommunitiesContext = createContext<CommunitiesState>({} as CommunitiesState);

export const useCommunities = () => useContext(CommunitiesContext);

const emptyCommunities: CommunitiesMapByFeature = {
  canShare: {},
  canPost: {},
  canSmartPantry: {},
  canNone: {}
}

const removePrefix = (id: string): string => {
  return id.replace(/^community-/i, '');
}

export const CommunitiesProvider: React.FC<React.PropsWithChildren> = ({children}) => {
  const {uid} = useProfile();

  const firestore: Firestore = useFirestore();
  const ref = doc(firestore, 'users', uid);
  const {data: userData}  = useFirestoreDocData(ref, {idField: 'id'});
  const communityIds: string[] = Object.keys(userData.private.communities);
  
  const communitiesCollection = collection(firestore, 'communities');
  const communitiesQuery = query(communitiesCollection,
				 where(documentId(), 'in', communityIds.map(removePrefix)));
  const {data: communitiesData} = useFirestoreCollectionData(communitiesQuery, {idField: 'id'});
  
  const communities: CommunitiesMapByFeature = {
    canShare: Object.fromEntries(communitiesData.filter((community) => community.features.canShare === true)
			     .map(community => [community.id, community.doc])),
    canPost: Object.fromEntries(communitiesData.filter((community) => community.features.canPost === true)
			    .map(community => [community.id, community.doc])),
    canSmartPantry: Object.fromEntries(communitiesData.filter((community) => community.features.canSmartPantry === true)
				   .map(community => [community.id, community.doc])),
    canNone: Object.fromEntries(communitiesData.filter((community) => community.features.canShare === false
								 && community.features.canPost === false
								 && community.features.canSmartPantry === false)
					       .map(community => [community.id, community.doc]))
  };

  return <CommunitiesContext.Provider
	   children={children}
	   value={{
	     communities,
	     communityIds
	   }}
  />;
}
