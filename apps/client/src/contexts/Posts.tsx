import {
  collection,
  Firestore,
  where,
  query
} from 'firebase/firestore';
import {
  createContext,
  useContext,
  useState,
} from 'react';
import {postSchema} from '@/components/schema';
import {useCommunities} from '@/contexts/Communities';
import {
  useFirestore,
  useFirestoreCollectionData,
} from 'reactfire';
import {z} from 'zod';

type Post = z.infer<typeof postSchema>;

export interface PostsState {
  posts: Post[]
}

const PostsContext = createContext<PostsState>({} as PostsState);

export const usePosts = () => useContext(PostsContext);

export const PostsProvider: React.FC<React.PropsWithChildren> = ({
  children
}) => {
  const {communityIds} = useCommunities();
  const firestore: Firestore = useFirestore();
  const postsCollection = collection(firestore, 'posts');
  const postsQuery = query(postsCollection,
			   where('communities',
				 'array-contains-any',
				 communityIds
  ));
  const {data: postsData} = useFirestoreCollectionData(postsQuery, {idField: 'id'});
  
  return <PostsContext.Provider
	   value={{
	     // todo: double check typecheck
	     // @ts-ignore
	     posts: postsData
	   }}>
    {children}
  </PostsContext.Provider>
}
