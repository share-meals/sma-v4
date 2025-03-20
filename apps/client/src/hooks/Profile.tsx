// todo: user is still undefined
import {
  auth,
  database,
  firestore
} from '@/components/Firebase';
import {BundleTransformers} from './BundleTransformers';
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
  ref,
  onValue
} from 'firebase/database';
import type {Community} from '@sma-v4/schema';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {FirebaseMessaging} from '@capacitor-firebase/messaging';
import {merge} from 'lodash';
import {normalizeForUrl} from '@/utilities/normalizeForUrl';
import {onAuthStateChanged} from 'firebase/auth';
import {
  postSchema,
  shareSchema
} from '@sma-v4/schema';
import {signOut} from 'firebase/auth';
import {Timestamp} from 'firebase/firestore';
import {useMessaging} from '@/hooks/Messaging';


// TODO: create a profile schema
const defaultProfile: any = {
  private: {
    communities: {},
    language: 'en',
    smartPantry: {
      points: 0,
      timestamp: Timestamp.fromDate(new Date(0)) // 1970-1-1
    }
  }
};

interface Profile {
  bundles: any;
  bundlePostsLength: number;
  communities: {[key: string]: Community};
  features: any;
  isLoading: boolean;
  isLoggedIn: boolean;
  unreadMessagesCount: number;
  user: any;
  posts: any;
  postsLength: number;
  profile: any;
  signout: () => void;
  requestedUrl: any;
  requestedUrlSignoutFlag: any;
}

const ProfileContext = createContext<Profile>({} as Profile);

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

  const [chatDashboard, setChatDashboard] = useState<any>(undefined);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState<number>(0);
  const chatDashboardUnsubscribe = useRef<Unsubscribe>();

  const [posts, setPosts] = useState<any>(undefined);
  const [postsLength, setPostsLength] = useState<number>(0);
  const postsUnsubscribe = useRef<Unsubscribe>();

  const [bundles, setBundles] = useState<any>(undefined);
  const [bundlePostsLength, setBundlePostsLength] = useState<number>(0);
  const bundlesUnsubscribe = useRef<Unsubscribe>();

  // if user wants to go to a page but is not logged in; redirect them once logged in
  const requestedUrl = useRef<string | null>(null);
  // when signing out, AuthGuard can mistakenly save /account as a requested URL. instead, set and clear this flag as needed
  const requestedUrlSignoutFlag = useRef<boolean>(false);
  
  useEffect(() => {
    onAuthStateChanged(auth, (userState) => {
      if(userState && userRef.current === null){
	// logging in
	// set all values to undefined so AppLoader triggers
	setProfile(undefined);
	setCommunities(undefined);
	setBundles(undefined);
	setBundlePostsLength(0);
	setPosts(undefined);
	setPostsLength(0);
      }
      setUser(userState);
      userRef.current = userState;
    });
  }, []);

  useEffect(() => {
    if(user){
      const userDoc = doc(firestore, 'users', user.uid);
      const profileUnsub = onSnapshot(userDoc, (d) => {
	setProfile(merge(
	  {},
	  defaultProfile,
	  d.data()
	));
      });
      profileUnsubscribe.current = profileUnsub;

      const chatDashboard = ref(database, `/chatDashboard/${user.uid}`);
      const chatDashboardUnsub = onValue(chatDashboard, (snapshot) => {
	//console.log(snapshot.val());
      });
      chatDashboardUnsubscribe.current = chatDashboardUnsub;
    }else{
      if(user !== undefined){
	if(profileUnsubscribe.current){
	  profileUnsubscribe.current();
	}
	setProfile(null);

	if(chatDashboardUnsubscribe.current){
	  chatDashboardUnsubscribe.current();
	}
	setChatDashboard(null);
      }
    }
  }, [user]);
  
  useEffect(() => {
    if(profile){
      if(profile.private && profile.private.communities){
	// communityIds are fixed
	const communityIds = Object.keys(profile.private.communities);
	const unfixedCommunityIds = communityIds.length === 0 ? ['NULL'] : communityIds.map((id) => id.replace(/^community-/i, ''));
	const communitiesCollection = collection(firestore, 'communities');
	const communitiesQuery = query(
	  communitiesCollection,
	  where(
	    documentId(),
	    'in',
	    unfixedCommunityIds
	));
	const communitiesUnsub = onSnapshot(communitiesQuery, (snapshot) => {
	  let canPost: string[] = [];
	  let canShare: string[] = [];
	  let canSmartPantry: string[] = [];
	  const comms = Object.fromEntries(snapshot.docs.map((doc) => {
	    const {codes, ...data} = doc.data();
	    // todo: typing
	    const membership = profile.private.communities[`community-${doc.id}`];
	    if((data.features.canPost && !data.features.mustWhitelistPost)
	       || (data.features.canPost && data.features.mustWhitelistPost && membership === 'admin')){
	      canPost.push(doc.id);
	    }
	    if(data.features.canShare){
	      canShare.push(doc.id);
	    }
	    if(data.features.canSmartPantry){
	      canSmartPantry.push(doc.id);
	    }
	    return [doc.id, {
	      id: doc.id,
	      //myMembership: membership,
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

	const bundlesCollection = collection(firestore, 'dataBundles');
	const bundlesQuery = query(
	  bundlesCollection,
	  where(
	    'communities',
	    'array-contains-any',
	    unfixedCommunityIds
	));

	const bundlesUnsub = onSnapshot(bundlesQuery, async (snapshot) => {
	  let bundles: {[key: string]: any} = {};
	  let bundlePostsCount: number = 0;
	  for(const doc of snapshot.docs){
	    if(BundleTransformers[doc.data().source]){
	      const data = await (await fetch(doc.data().url)).json();
	      bundles[normalizeForUrl(doc.data().name)] = {
		name: doc.data().name,
		timestamp: doc.data().timestamp,
		posts: Object.fromEntries(await data.map((record: any) => {
		  return BundleTransformers[doc.data().source]({
		    bundleName: doc.data().name,
		    communities: doc.data().communities,
		    record
		  });
		}))
	      };
	      bundlePostsCount += data.length;
	    }
	  };
	  setBundles(bundles);
	  setBundlePostsLength(bundlePostsCount);
	});
	bundlesUnsubscribe.current = bundlesUnsub;

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
	    // TODO: better typing - type does not exist on p
	    // @ts-ignore
	    switch(p.type){
	      case 'post':
		const postSchemaCompliance = postSchema.safeParse(p);
		if(!postSchemaCompliance.success){
		  console.log(postSchemaCompliance.error);
		  // post retrieved from firebase does not match schema
		  // todo: better handling
		}
		break;
	      case 'share':
		const shareschemaCompliance = shareSchema.safeParse(p);
		if(!shareschemaCompliance.success){
		  console.log(shareschemaCompliance.error);
		  // post retrieved from firebase does not match schema
		  // todo: better handling
		}
		break;
	      default:
		// TODO: throw an error because type has to be one of these
		break;
	    }
	    
	  }
	  setPosts(ps);
	  setPostsLength(Object.keys(ps).length);
	});
	postsUnsubscribe.current = postsUnsub;
      }else{
	// logged in but has no communities
	setBundles({});
	setBundlePostsLength(0);
	setCommunities([]);
	setPosts({});
	setPostsLength(0);
	setFeatures({
	  canPost: [],
	  canShare: [],
	  canSmartPantry: [],
	});
      }
    }else{
      // logging out?
      if(profile !== undefined){
	if(communitiesUnsubscribe.current){
	  communitiesUnsubscribe.current();
	}
	setCommunities(null);
	if(bundlesUnsubscribe.current){
	  bundlesUnsubscribe.current();
	}
	if(postsUnsubscribe.current){
	  postsUnsubscribe.current();
	}
	setBundles(null);
	setBundlePostsLength(0);
	setPosts(null);
	setPostsLength(0);
	setFeatures({
	  canPost: [],
	  canShare: [],
	  canSmartPantry: [],
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
    setBundles(undefined);
    setBundlePostsLength(0);
    if(bundlesUnsubscribe.current !== undefined){
      bundlesUnsubscribe.current();
      bundlesUnsubscribe.current = undefined;
    }
    setPosts(undefined);
    setPostsLength(0);
    if(postsUnsubscribe.current !== undefined){
      postsUnsubscribe.current();
      postsUnsubscribe.current = undefined;
    }
    requestedUrlSignoutFlag.current = true;
    signOut(auth)
      .then(() => {
      });
  }, [auth, setUser, setProfile, setCommunities, setPosts]);

  const isLoading = user !== undefined
		 && profile !== undefined
		 && communities !== undefined
		 && posts !== undefined
		 && bundles !== undefined;
  return <ProfileContext.Provider
	   value={{
	     bundles,
	     bundlePostsLength,
	     communities,
	     features,
	     isLoading,
	     isLoggedIn: user !== null,
	     unreadMessagesCount,
	     user,
	     posts,
	     postsLength,
	     profile,
	     requestedUrl,
	     requestedUrlSignoutFlag,
	     signout,
	   }}>
    {children}
  </ProfileContext.Provider>;
};
