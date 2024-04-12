import {CommunityTags} from '@/components/CommunityTags';
import {DietaryTags} from '@/components/DietaryTags';
import {FormattedMessage} from 'react-intl';
import {
  format,
  isPast,
} from 'date-fns';
import {
  getFunctions,
  httpsCallable,
} from 'firebase/functions';
import {
  IonButton,
  IonCol,
  IonGrid,
  IonRow,
  IonText,
  useIonViewWillEnter,
} from '@ionic/react';
import {Map} from '@/components/Map';
import {MapLayer} from '@share-meals/frg-ui';
import Markdown from 'react-markdown';
import {postSchema} from '@sma-v4/schema';
import {useParams} from 'react-router-dom';
import {useI18n} from '@/hooks/I18n';
import {useProfile} from '@/hooks/Profile';
import {
  useState,
  useMemo,
} from 'react';
import {z} from 'zod';

import LocationIcon from '@material-symbols/svg-400/rounded/location_on-fill.svg';

type Post  = z.infer<typeof postSchema>;

import {useEffect} from 'react';

export const ViewPost: React.FC = () => {
  const {id} = useParams<{id: string}>();
  const {posts: {[id]: post}} = useProfile();
  const functions = getFunctions();
  const logPostViewFunction = httpsCallable(functions, 'user-log-post-view');
  useIonViewWillEnter(() => {
    logPostViewFunction({id});
  });
  if(post){
    return <PostContent post={post} />;
  }else{
    return <div className='ion-padding'>
      <IonText>
	<h1>
	  <FormattedMessage id='pages.viewPost.notFoundOrNoLongerAvailable' />
	</h1>
      </IonText>
    </div>;
  }
};

const PostContent: React.FC<{post: Post}> = ({post}) => {
  const {dateFnsLocale} = useI18n();
  const [showMap, setShowMap] = useState<boolean>(false);
  const layer: MapLayer = useMemo(() => ({
    fillColor: 'red',
    geojson: {
      type: 'FeatureCollection',
      features: [
	{
	  type: 'Feature',
	  geometry: {
	    type: 'Point',
	    coordinates: [
	      post.location.lng,
	      post.location.lat
	    ]
	  }
	}
      ]
    },
    icon: {
      src: LocationIcon,
      scale: 1
    },
    name: 'marker',
    strokeColor: 'green',
    type: 'vector'
  }), [post.location.lat, post.location.lng]);
  return <div className='ion-padding'>
    <IonText>
      <h1 className='ion-text-center ion-no-margin'>
	{post.title}
      </h1>
    </IonText>
    <p>
      {isPast(post.starts)
      ? <FormattedMessage id='common.label.started' />
      : <FormattedMessage id='common.label.starts' />} {format(post.starts, 'PPpp', {locale: dateFnsLocale})}
      <br />
      {isPast(post.ends)
      ? <FormattedMessage id='common.label.ended' />
      : <FormattedMessage id='common.label.ends' />} {format(post.ends, 'PPpp', {locale: dateFnsLocale})}
    </p>
    <p>
    {post.location.name ? <>{post.location.name}<br /></> : <></>}
      {post.location.address}
      <br />
      <a className='text-button' onClick={() => {setShowMap(!showMap);}}>
	{showMap
	? <FormattedMessage id='pages.viewPost.hideMap' />
	: <FormattedMessage id='pages.viewPost.showMap' />}
      </a>
    </p>
      {showMap && <div style={{height: '20rem'}}>
	<Map
	center={{lat: post.location.lat, lng: post.location.lng}}
	layers={[layer]}
	zoom={17}
	/>
      </div>}
    {post.tags && <div>
      <DietaryTags tags={post.tags} />
    </div>}
    <div>
      <CommunityTags communities={post.communities} />
    </div>
    {post.servings && <IonText>
      <p>
	<FormattedMessage id='common.label.servingsWithValue' values={{number: post.servings}} />
      </p>
    </IonText>}
    <IonText>
      <Markdown>
	{post.details}
      </Markdown>
    </IonText>
  </div>;
};
