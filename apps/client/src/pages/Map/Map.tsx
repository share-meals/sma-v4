import {ClusterLayerStyle} from './ClusterLayerStyle';
import {Feature} from 'ol';
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
import {fromLonLat} from 'ol/proj';
import {
  latlngSchema,
  postSchema
} from '@sma-v4/schema';
//import {LoadingIndicator} from '@/components/LoadingIndicator';
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
//import {useGeolocation} from '@/components/GeolocationWrapper';
import {useProfile} from '@/hooks/Profile';
import {z} from 'zod';

type latlng = z.infer<typeof latlngSchema>;
type post = z.infer<typeof postSchema>;

import CloseSharpIcon from '@material-design-icons/svg/sharp/close.svg';

const defaultLocation: latlng = {lat: 40.78016900410382, lng: -73.96877450706982}; // Delacorte Theater


const convertToFeature = (post: post): Feature => {
  return new Feature({
    geometry: new Point(fromLonLat([post.location.lng, post.location.lat])),
    name: post.title, // todo: is this necessary?
    properties: post,
    uid: post.id
  });
};


const InfoModal: React.FC<{posts: post[]}> = ({posts}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  useEffect(() => {
    if(posts.length > 0){
      setIsOpen(true);
    }
  }, [posts]);

  return <IonModal isOpen={isOpen} onDidDismiss={() => {setIsOpen(false);}}>
      <IonHeader className='ion-no-border'>
	<IonToolbar color='dark'>
	  <IonTitle>
	    hello
	  </IonTitle>
	  <IonButtons slot='end'>
	    <IonButton onClick={() => {setIsOpen(false);}}>
	      <IonIcon src={CloseSharpIcon}/>
	    </IonButton>
	  </IonButtons>
	</IonToolbar>
      </IonHeader>
    <IonContent>
      {posts.map((p) => <PostInfoBanner key={p.id} {...p} />)}
    </IonContent>
  </IonModal>;
};

export const Map: React.FC = () => {
  /*
  const {
    getGeolocation,
    lastGeolocation,
    permissionState
  } = useGeolocation();
  */
  const {posts} = useProfile();
  const [clickedPosts, setClickedPosts] = useState<post[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const features = useMemo(() => Object.values(posts).map((f: any) => (
    <RFeature
      key={f.id}
      feature={convertToFeature(f)}
    />
  )), [posts]);

  /*
  useEffect(() => {
    getGeolocation()
      .then(() => {
	// do nothing
	// lastGeolocation is updated
      })
      .catch((error) => {
	console.log(error);
      });
  }, []);
  */
  /*
  if(permissionState === 'prompt'
     || permissionState === 'prompt-with-rationale'){
    return <div style={{height: '100%'}}>
      <LoadingIndicator />
    </div>
  }
  */

  if(posts === null){
    return <></>;
  }
  
  //const center: latlng = lastGeolocation || defaultLocation;
  const center = {
    lat: 40.73778660789576,
    lng: -73.98966952873556
  };
  return <div style={{height: 'calc(100vh - 113px)'}}>
    <RMap
      height='100%'
      initial={{
	center: fromLonLat([
	  center.lng,
	  center.lat
	]),
	zoom: 14
      }}>
      <ROSM />
      <RLayerCluster
	onClick={(event) => {
	  const posts = event.target.get('features').map((p: Feature) => p.getProperties().properties);
	  setClickedPosts(posts);
	}}
	distance={50}>
	{features}
	<ClusterLayerStyle />
      </RLayerCluster>
    </RMap>
    <InfoModal
      posts={clickedPosts}
    />
  </div>;
}
