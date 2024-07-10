import {ClusterLayerStyle} from './ClusterLayerStyle';
import {Feature} from 'ol';
import {FormattedMessage} from 'react-intl';
import {fromLonLat} from 'ol/proj';
import {
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
import {Map as FRGMap} from '@/components/Map';
import {Point} from 'ol/geom';
import {PostInfoBanner} from '@/components/PostInfoBanner';
import {
  RFeature,
  RLayerCluster,
  RMap,
  ROSM
} from 'rlayers';
import {
  useEffect,
  useMemo,
  useState
} from 'react';
import {useGeolocation} from '@/hooks/Geolocation';
import {useProfile} from '@/hooks/Profile';
import {z} from 'zod';

type latlng = z.infer<typeof latlngSchema>;
type post = z.infer<typeof postSchema>;

import CloseSharpIcon from '@material-design-icons/svg/sharp/close.svg';

const defaultLocation: latlng = {lat: 40.78016900410382, lng: -73.96877450706982}; // Delacorte Theater

const InfoModal: React.FC<{posts: post[]}> = ({posts}) => {
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
	      <IonIcon src={CloseSharpIcon}/>
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
  
  useEffect(() => {
    (async () => {
      if(lastGeolocation === undefined){
	getGeolocation()
	  .catch((error) => {
	    console.log(error);
	  });
      }
    })();
  }, [lastGeolocation]);
  const {posts} = useProfile();
  const [clickedPosts, setClickedPosts] = useState<post[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  // todo: || [] is a hack
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
      type: 'cluster' as 'cluster',
      clusterDistance: 50
    };
  }, [posts]);
  if(
    posts === null
    || permissionState === 'prompt'
    || permissionState === 'prompt-with-rationale'
    || (
      permissionState === 'denied'
      && lastGeolocation === undefined
    )
  ){
    return <div style={{height: 'calc(100vh - 113px)'}}>
      <LoadingIndicator />
    </div>;
  }
  return <div style={{
    height: 'calc(100vh - 113px)',
    position: 'relative'
  }}>
    <FRGMap
      center={{
	lat: lastGeolocation!.lat,
	lng: lastGeolocation!.lng
      }}
      layers={[featuresLayer]}
      onFeatureClick={({data}) => {
	setClickedPosts(data);
      }}
    />
    <InfoModal
      posts={clickedPosts}
    />
  </div>;
}
