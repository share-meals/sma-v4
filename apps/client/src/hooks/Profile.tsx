import {
  auth,
  firestore
} from '@/components/Firebase';
import {
  collection,
  doc,
  documentId,
  onSnapshot,
  query,
  Unsubscribe,
  where,
} from 'firebase/firestore';
import {
  onAuthStateChanged,
} from 'firebase/auth';
import {signOut} from 'firebase/auth';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';


const ProfileContext = createContext<any>({} as any);

export const useProfile = () => useContext(ProfileContext);

export const ProfileProvider: React.FC<React.PropsWithChildren> = ({children}) => {
  const [user, setUser] = useState<any>(undefined);
  const [profile, setProfile] = useState<any>(undefined);
  const profileUnsubscribe = useRef<Unsubscribe>();
  const [features, setFeatures] = useState<any>({});
  const [communities, setCommunities] = useState<any>(undefined);
  const communitiesUnsubscribe = useRef<Unsubscribe>();

  const [posts, setPosts] = useState<any>(undefined);
  const postsUnsubscribe = useRef<Unsubscribe>();
  
  useEffect(() => {
    onAuthStateChanged(auth, (userState) => {
      setUser(userState);
    });
  }, []);

  useEffect(() => {
    if(user){
      const userDoc = doc(firestore, 'users', user.uid);
      const unsub = onSnapshot(userDoc, (d) => {
	setProfile(d.data());
      });
      profileUnsubscribe.current = unsub;
    }else{
      if(user !== undefined){
	if(profileUnsubscribe.current){
	  profileUnsubscribe.current();
	}
	setProfile(null);
      }
    }
  }, [user]);

  useEffect(() => {
    if(profile){
      const communityIds = Object.keys(profile.private.communities);
      const unfixedCommunityIds = communityIds.map((id) => id.replace(/^community-/i, ''));
      const communitiesCollection = collection(firestore, 'communities');
      const communitiesQuery = query(
	communitiesCollection,
	where(
	  documentId(),
	  'in',
	  unfixedCommunityIds
      ));

      const communitiesUnsub = onSnapshot(communitiesQuery, (snapshot) => {
	const comms = Object.fromEntries(snapshot.docs.map((doc) => [doc.id, doc.data()]));
	const canPost = Object.values(comms).reduce((accumulator, value) => accumulator || value.features.canPost, false);
	const canShare = Object.values(comms).reduce((accumulator, value) => accumulator || value.features.canShare, false);
	const mustWhitelistPost = Object.values(comms).reduce((accumulator, value) => accumulator || value.features.mustWhitelistPost, false);
	const canSmartPantry = Object.values(comms).reduce((accumulator, value) => accumulator || value.features.canSmartPantry, false);
	setFeatures({
	  canPost,
	  canShare,
	  mustWhitelistPost,
	  canSmartPantry,
	});
	setCommunities(comms);
      });
      communitiesUnsubscribe.current = communitiesUnsub;

      const postsCollection = collection(firestore, 'posts');
      const postsQuery = query(
	postsCollection,
	where(
	  'communities',
	  'array-contains-any',
	  communityIds
      ));

      const postsUnsub = onSnapshot(postsQuery, (snapshot) => {
	  const ps = Object.fromEntries(snapshot.docs.map((doc) => [doc.id, doc.data()]));
	  setPosts(ps);
      });
      postsUnsubscribe.current = postsUnsub;
    }else{
      if(profile !== undefined){
	if(communitiesUnsubscribe.current){
	  communitiesUnsubscribe.current();
	}
	setCommunities(null);
	if(postsUnsubscribe.current){
	  postsUnsubscribe.current();
	}
	setPosts(null);
      }
    }
  }, [profile]);

  const signout = useCallback(() => {
    setUser(undefined);
    setProfile(undefined);
    setCommunities(undefined);
    setPosts(undefined);
    signOut(auth)
      .then(() => {
      });
  }, [auth, setUser, setProfile, setCommunities, setPosts]);

  const isLoading = user !== undefined
		 && profile !== undefined
		 && communities !== undefined
		 && posts !== undefined;
  
  return <ProfileContext.Provider
	   value={{
	     communities,
	     features,
	     isLoading,
	     isLoggedIn: user,
	     user,
	     posts,
	     profile,
	     signout
  }}>
    {children}
  </ProfileContext.Provider>;
};
