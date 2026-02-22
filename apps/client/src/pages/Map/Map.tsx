import {
  FormattedMessage,
  useIntl,
} from 'react-intl';
import {
  generateCurrentLocationLayer,
  vectorLayerConstants
} from '@/utilities/map';
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
import {LoadingIndicator} from '@/components/LoadingIndicator';
import {
  LocateMeControl,
  Map as FRGMap,
} from '@/components/Map';
import {PostInfoBanner} from '@/components/PostInfoBanner';
import {Redirect} from 'react-router-dom';
import {
  TimestampedLatLng,
  ZoomControls,
} from '@share-meals/frg-ui';
import {
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'react';
import {useGeolocation} from '@/hooks/Geolocation';
import {useProfile} from '@/hooks/Profile';
import {z} from 'zod';

import '@/components/Map/ZoomControls.css';

type PostType = z.infer<typeof postSchema>;

import CloseIcon from '@material-symbols/svg-400/rounded/close.svg';
import ListsIcon from '@material-symbols/svg-400/rounded/lists.svg';

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
  const mapHeight = 'calc(100vh - 112px - var(--ion-safe-area-top) - var(--ion-safe-area-bottom))'
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
	zIndex: 2,
	...vectorLayerConstants
      }
    });
  }, [bundles]);
  const featuresLayer = useMemo(() => {
    const geojson = {
      type: 'FeatureCollection',
      features: Object.values(posts || [])
		      .filter((p: any) => p.location.lat !== -999 && p.location.lng !== -999)
		      .map((post: any) => {
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
      zIndex: 2,
      ...vectorLayerConstants
    };
  }, [posts]);
  const currentLocationLayer = useMemo(() => {
    return generateCurrentLocationLayer({
      defaultLocation,
      lastGeolocation
    });
  }, [defaultLocation, lastGeolocation]);
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

  const controls = <>
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      position: 'absolute',
      right: '1rem',
      top: '1rem',
      zIndex: 999
    }}>
      {!geolocationDenied && <LocateMeControl setCurrentLocation={changeCenter} />}
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
    </div>
    <ZoomControls increment={1}
		  zoomOutControlProps={{
		    className: 'square',
		  }}
		  zoomInControlProps={{
		    className: 'square'
		  }}
    />
  </>;

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
	     style={{height: mapHeight}}>
      <LoadingIndicator />
    </div>;
  }
  return <div
	   data-testid='pages.map'
	   style={{
	     height: mapHeight,
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
      onMapClick={({data}: any) => {
	setClickedPosts(
	  data.filter((datum: any) => datum.layerName !== 'Current Location')
	)
      }}
      zoom={{level: 14}}
    />
    <InfoModal
      posts={clickedPosts}
    />
  </div>;
}
