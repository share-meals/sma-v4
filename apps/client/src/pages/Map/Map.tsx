import {ClusterLayerStyle} from './ClusterLayerStyle';
import {Feature} from 'ol';
import {FormattedMessage} from 'react-intl';
import {fromLonLat} from 'ol/proj';
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
import {
  latlngSchema,
  postSchema
} from '@sma-v4/schema';
import {LoadingIndicator} from '@/components/LoadingIndicator';
import {
  LocateMeControl,
  Map as FRGMap,
} from '@/components/Map';
import {Point} from 'ol/geom';
import {PostInfoBanner} from '@/components/PostInfoBanner';
import {
  RFeature,
  RLayerCluster,
  RMap,
  ROSM
} from 'rlayers';
import {
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'react';
import {useGeolocation} from '@/hooks/Geolocation';
import {useProfile} from '@/hooks/Profile';
import {z} from 'zod';

type LatLngType = z.infer<typeof latlngSchema>;
type PostType = z.infer<typeof postSchema>;

import CloseIcon from '@material-symbols/svg-400/rounded/close.svg';
import ListsIcon from '@material-symbols/svg-400/rounded/lists.svg';
import LocationMarkerIcon from '@/assets/svg/locationMarker.svg';

const defaultLocation: LatLngType = {lat: 40.78016900410382, lng: -73.96877450706982}; // Delacorte Theater

const InfoModal: React.FC<{posts: PostType[]}> = ({posts}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
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
  
  return <IonModal isOpen={isOpen} onDidDismiss={() => {setIsOpen(false);}}>
      <IonHeader className='ion-no-border'>
	<IonToolbar color='primary'>
	  <IonTitle>
	    <FormattedMessage id='pages.map.postsList' />
	  </IonTitle>
	  <IonButtons slot='end'>
	    <IonButton onClick={() => {setIsOpen(false);}}>
	      <IonIcon src={CloseIcon}/>
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
  const [center, setCenter] = useState<LatLngType | null>(null);

  useEffect(() => {
    (async () => {
      if(center === null){
	getGeolocation()
	  .then(setCenter)
	  .catch((error: unknown) => {
	    // TODO: error checking
	  })
      }else{
	
      }
    })();
  }, [center, getGeolocation]);
  const {posts} = useProfile();
  const [clickedPosts, setClickedPosts] = useState<PostType[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
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
  const changeCenter = useCallback((location: LatLngType) => {
    setCenter(location);
  }, [setCenter]);
  const showAllPosts = useCallback(() => {
    setClickedPosts(Object.values(posts));
  }, [posts, setClickedPosts]);
  const postsLength = Object.keys(posts).length;
  const controls = <div style={{
    display: 'flex',
    flexDirection: 'column',
    position: 'absolute',
    right: '1rem',
    top: '1rem',
    zIndex: 999
  }}>
    <LocateMeControl setCurrentLocation={changeCenter} />
    {postsLength > 0 &&
     <IonButton className='square has-badge' onClick={showAllPosts}>
       <IonIcon slot='icon-only' src={ListsIcon} />
       <IonBadge color='light'>
	 {postsLength}
       </IonBadge>
     </IonButton>
    }
  </div>;
  if(postsNotReady
     || (geolocationDenied && geolocationNoBackup)
     || (geolocationAwaitingPrompt && geolocationNoBackup)){
    return <div style={{height: 'calc(100vh - 113px)'}}>
      <LoadingIndicator />
    </div>;
  }
  return <div style={{
    height: 'calc(100vh - 113px)',
    position: 'relative'
  }}>
    <FRGMap
      center={center!}
      controls={controls}
      layers={[
	featuresLayer,
	currentLocationLayer,
      ]}
      onFeatureClick={({data}: any) => {
	// check if data is a list of features or not
	if(data instanceof Array){
	  setClickedPosts(data)
	}
      }}
      zoom={14}
    />
    <InfoModal
      posts={clickedPosts}
    />
  </div>;
}
