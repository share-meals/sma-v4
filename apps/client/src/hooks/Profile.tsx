// todo: user is still undefined

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
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {FirebaseMessaging} from '@capacitor-firebase/messaging';
import {
  onAuthStateChanged,
} from 'firebase/auth';
import {postSchema} from '@sma-v4/schema';
import {signOut} from 'firebase/auth';
import {useMessaging} from '@/hooks/Messaging';

// todo: remove any typing
const ProfileContext = createContext<any>({} as any);

export const useProfile = () => useContext(ProfileContext);

export const ProfileProvider: React.FC<React.PropsWithChildren> = ({children}) => {
  const {
    clearMessagingToken,
    updateCommunitySubscriptions,
  } = useMessaging();
  const [user, setUser] = useState<any>(undefined);
  const userRef = useRef<any>(user);
  const [profile, setProfile] = useState<any>(undefined);
  const profileUnsubscribe = useRef<Unsubscribe>();
  const [features, setFeatures] = useState<any>({});
  const [communities, setCommunities] = useState<any>(undefined);
  const communitiesUnsubscribe = useRef<Unsubscribe>();

  const [posts, setPosts] = useState<any>(undefined);
  const postsUnsubscribe = useRef<Unsubscribe>();
  
  useEffect(() => {
    onAuthStateChanged(auth, (userState) => {
      if(userState && userRef.current === null){
	// logging in
	// set all values to undefined so AppLoader triggers
	setProfile(undefined);
	setCommunities(undefined);
	setPosts(undefined);
      }
      setUser(userState);
      userRef.current = userState;
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
      if(profile.private && profile.private.communities){
	// communityIds are fixed
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
	  let canPost = false;
	  let canShare = false;
	  let canSmartPantry = false;
	  const comms = Object.fromEntries(snapshot.docs.map((doc) => {
	    const {codes, ...data} = doc.data();
	    // todo: typing
	    const membership = profile.private.communities[`community-${doc.id}`];
	    canPost = canPost || (
	      (data.features.canPost && !data.features.mustWhitelistPost)
	      || (data.features.canPost && data.features.mustWhitelistPost && membership === 'admin')
	    );
	    canShare = canShare || data.features.canShare;
	    canSmartPantry = canSmartPantry || data.features.canSmartPantry;
	    return [doc.id, {
	      id: doc.id,
	      myMembership: membership,
	      ...data
	    }];
	  }));
	  setFeatures({
	    canPost,
	    canShare,
	    canSmartPantry,
	  });
	  setCommunities(comms);
	  updateCommunitySubscriptions(communityIds);
	});
	communitiesUnsubscribe.current = communitiesUnsub;
	const postsCollection = collection(firestore, 'posts');
	const postsQuery = query(
	  postsCollection,
	  where(
	    'communities',
	    'array-contains-any',
	    unfixedCommunityIds
	));
	
	const postsUnsub = onSnapshot(postsQuery, (snapshot) => {
	  const ps = Object.fromEntries(snapshot.docs.map((doc) => [doc.id, {
	    ...doc.data(),
	    id: doc.id,
	    // convert ends and starts to date since stored as Firestore Timestamps to take advantage of TTL
	    ends: doc.data().ends.toDate(),
	    starts: doc.data().starts.toDate(),
	  }]));
	  for(const p of Object.values(ps)){
	    const schemaCompliance = postSchema.safeParse(p);
	    if(!schemaCompliance.success){
	      console.log(schemaCompliance.error);
	      // post retrieved from firebase does not match schema
	      // todo: better handling
	    }
	  }
	  setPosts(ps);
	});
	postsUnsubscribe.current = postsUnsub;
      }else{
	// logged in but has no communities
	setCommunities([]);
	setPosts({});
	setFeatures({
	  canPost: false,
	  canShare: false,
	  canSmartPantry: false,
	});
      }
    }else{
      // logging out?
      if(profile !== undefined){
	if(communitiesUnsubscribe.current){
	  communitiesUnsubscribe.current();
	}
	setCommunities(null);
	if(postsUnsubscribe.current){
	  postsUnsubscribe.current();
	}
	setPosts(null);
	setFeatures({
	  canPost: false,
	  canShare: false,
	  canSmartPantry: false,
	});
      }
    }
  }, [profile]);

  const signout = useCallback(() => {
    //FirebaseMessaging.deleteToken();
    //FirebaseMessaging.removeAllListeners();
    //clearMessagingToken(userRef.current.uid);
    updateCommunitySubscriptions(null);
    setUser(undefined);
    userRef.current = undefined;
    setProfile(undefined);
    if(profileUnsubscribe.current !== undefined){
      profileUnsubscribe.current();
      profileUnsubscribe.current = undefined;
    }
    setCommunities(undefined);
    if(communitiesUnsubscribe.current !== undefined){
      communitiesUnsubscribe.current();
      communitiesUnsubscribe.current = undefined;
    }
    setPosts(undefined);
    if(postsUnsubscribe.current !== undefined){
      postsUnsubscribe.current();
      postsUnsubscribe.current = undefined;
    }
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
