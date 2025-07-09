import {
  FormattedMessage,
  useIntl,
} from 'react-intl';
import {
  IonBadge,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonModal,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import {postSchema} from '@sma-v4/schema';
import {TimestampedLatLng} from '@share-meals/frg-ui';
import {LoadingIndicator} from '@/components/LoadingIndicator';
import {
  LocateMeControl,
  Map as FRGMap,
} from '@/components/Map';
import {PostInfoBanner} from '@/components/PostInfoBanner';
import {Redirect} from 'react-router-dom';
import {
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'react';
import {useGeolocation} from '@/hooks/Geolocation';
import {useProfile} from '@/hooks/Profile';
import {z} from 'zod';

type PostType = z.infer<typeof postSchema>;

import CloseIcon from '@material-symbols/svg-400/rounded/close.svg';
import ListsIcon from '@material-symbols/svg-400/rounded/lists.svg';
import LocationMarkerIcon from '@/assets/svg/locationMarker.svg';

const defaultLocation: TimestampedLatLng = {lat: 40.78016900410382, lng: -73.96877450706982}; // Delacorte Theater

const InfoModal: React.FC<{posts: PostType[]}> = ({posts}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const intl = useIntl();
  useEffect(() => {
    if(posts.length > 0){
      setIsOpen(true);
    }
  }, [posts]);

  useEffect(() => {
    return () => {
      setIsOpen(false);
    }
  }, []);
  
  return <IonModal
	   aria-label={intl.formatMessage({id: 'pages.map.postsList.modal.ariaLabel'})}
	   isOpen={isOpen}
	   onDidDismiss={() => {setIsOpen(false);}}
	   role='dialog'>
    <IonHeader className='ion-no-border'>
      <IonToolbar color='primary'>
	<IonTitle>
	  <FormattedMessage id='pages.map.postsList' />
	</IonTitle>
	<IonButtons slot='end'>
	  <IonButton
	    aria-label={intl.formatMessage({id: 'pages.map.postsList.modal.close.button.ariaLabel'})}
	    onClick={() => {setIsOpen(false);}}>
	    <IonIcon aria-hidden='true' src={CloseIcon}/>
	  </IonButton>
	</IonButtons>
      </IonToolbar>
    </IonHeader>
    <IonContent color='light'>
      {posts.map((p) => <PostInfoBanner key={p.id} {...p} onNavigate={() => {setIsOpen(false);}}/>)}
    </IonContent>
  </IonModal>;
};

export const Map: React.FC = () => {
  const {
    getGeolocation,
    lastGeolocation,
    permissionState
  } = useGeolocation();
  const [center, setCenter] = useState<TimestampedLatLng | null>(null);
  const intl = useIntl();
  const {
    requestedUrl,
  } = useProfile();
  useEffect(() => {
    (async () => {
      if(center === null){
	getGeolocation()
	  .then(setCenter)
	  .catch((error: any) => {
	    console.log(error);
	    // TODO: error checking
	  })
      }else{
	
      }
    })();
  }, [center, getGeolocation]);
  const {
    bundles,
    bundlePostsLength,
    posts,
    postsLength
  } = useProfile();
  const [clickedPosts, setClickedPosts] = useState<PostType[]>([]);
  const bundlesLayer = useMemo(() => {
    if(bundles === undefined){
      return [];
    }
    return Object.values(bundles).map((bundle: any) => {
      const geojson = {
	type: 'FeatureCollection',
	features: Object.values(bundle.posts).map((post: any) => {
	  return {
	    type: 'Feature',
	    geometry: {
	      coordinates: [post.location.lng, post.location.lat],
	      type: 'Point'
	    },
	    properties: post
	  };
	})
      };

      return {
	name: bundle.name,
	geojson,
	featureWidth: 4,
	fillColor: 'rgba(11, 167, 100, 0.5)',
	strokeColor: 'rgba(255, 255, 255, 1)',
	textScale: 1.5,
	textFillColor: '#ffffff',
	textStrokeColor: '#000000',
	textStrokeWidth: 4,
	type: 'cluster',
	clusterDistance: 50,
	zIndex: 2
      }
    });
  }, [bundles]);
  const featuresLayer = useMemo(() => {
    const geojson = {
      type: 'FeatureCollection',
      features: Object.values(posts || []).map((post: any) => {
	return {
	  type: 'Feature',
	  geometry: {
	    coordinates: [post.location.lng, post.location.lat],
	    type: 'Point'
	  },
	  properties: post
	};
      })
    };
    
    return {
      name: 'Posts',
      geojson,
      featureWidth: 4,
      fillColor: 'rgba(11, 167, 100, 0.5)',
      strokeColor: 'rgba(255, 255, 255, 1)',
      textScale: 1.5,
      textFillColor: '#ffffff',
      textStrokeColor: '#000000',
      textStrokeWidth: 4,
      type: 'cluster',
      clusterDistance: 50,
      zIndex: 2
    };
  }, [posts]);
  const currentLocationLayer = {
    fillColor: '#ffffff',
    icon: LocationMarkerIcon,
    geojson: {
      type: 'FeatureCollection',
      features: [{
	type: 'Feature',
	geometry: {
	  coordinates: lastGeolocation ? [lastGeolocation.lng, lastGeolocation.lat] : defaultLocation,
	  type: 'Point'
	},
	properties: {}
      }]
    },
    name: 'Current Location',
    strokeColor: '#ffffff',
    type: 'vector',
    zIndex: 1
  };
  const postsNotReady = posts === null;
  const geolocationNoBackup = lastGeolocation === undefined;
  const geolocationDenied = permissionState === 'denied';
  const geolocationAwaitingPrompt = permissionState === 'prompt'
				 || permissionState === 'prompt-with-rationale';
  const changeCenter = useCallback((location: TimestampedLatLng) => {
    setCenter({
      ...location,
      timestamp: new Date()
    });
  }, [setCenter]);

  const showAllPosts = useCallback(() => {
    const bundlePosts = Object.values(bundles).map((b: any) => Object.values(b.posts)).flat();
    setClickedPosts(
      // @ts-ignore
      Object.values(posts).concat(bundlePosts)
    );
  }, [bundles, posts, setClickedPosts]);

  const controls = <div style={{
    display: 'flex',
    flexDirection: 'column',
    position: 'absolute',
    right: '1rem',
    top: '1rem',
    zIndex: 999
  }}>
    <LocateMeControl setCurrentLocation={changeCenter} />
    {(bundlePostsLength + postsLength) > 0 &&
     <IonButton
       aria-label={intl.formatMessage({id: 'pages.map.showAllPosts.button.ariaLabel'})}
       className='square icon-only has-badge'
       data-testid='pages.map.showAllPosts.button'
       onClick={showAllPosts}>
       <IonIcon
	 aria-hidden='true'
	 slot='icon-only'
	 src={ListsIcon} />
       <IonBadge color='light'>
	 {bundlePostsLength + postsLength}
       </IonBadge>
     </IonButton>
    }
  </div>;

  // /map is the default place to land once you're logged in and verified
  // if they are trying to access a restricted page, push them as needed
  if(requestedUrl.current !== null){
    const targetUrl = requestedUrl.current;
    requestedUrl.current = null;
    return <Redirect to={targetUrl} />;
  }
  
  if(postsNotReady
     || center === null
     || (geolocationDenied && geolocationNoBackup)
     || (geolocationAwaitingPrompt && geolocationNoBackup)){
    return <div
	     data-testid='pages.map.loadingIndicator'
	     style={{height: 'calc(100vh - 113px)'}}>
      <LoadingIndicator />
    </div>;
  }
  return <div
	   data-testid='pages.map'
	   style={{
	     height: 'calc(100vh - 113px)',
	     position: 'relative'
	   }}>
    <FRGMap
      center={center}
      controls={controls}
      layers={[
	currentLocationLayer,
	featuresLayer,
	...bundlesLayer
      ]}
      onFeatureClick={({data}: any) => {
	// check if data is a list of features or not
	if(data instanceof Array){
	  setClickedPosts(data)
	}
      }}
      zoom={{level: 14}}
    />
    <InfoModal
      posts={clickedPosts}
    />
  </div>;
}
