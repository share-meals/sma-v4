import {
  ActionSheetButton,
  IonActionSheet,
  IonButton,
  IonCol,
  IonGrid,
  IonIcon,
  IonList,
  IonListHeader,
  IonRow,
  IonText,
  useIonAlert,
  useIonViewWillEnter,
} from '@ionic/react';
import {Chat} from '@/components/Chat';
import classnames from 'classnames';
import {CommunityTags} from '@/components/CommunityTags';
import {DateTimeDisplay} from '@/components/DateTimeDisplay';
import {DietaryTags} from '@/components/DietaryTags';
import {
  FormattedMessage,
  useIntl
} from 'react-intl';
import {
  format,
  isPast,
} from 'date-fns';
import {
  getFunctions,
  httpsCallable,
} from 'firebase/functions';
import {
  LocateMeControl,
  Map,
} from '@/components/Map';
import {
  MapLayerProps,
  TimestampedLatLng,
} from '@share-meals/frg-ui';
import Markdown from 'react-markdown';
import {Photo} from '@/components/Photo';
import {postSchema} from '@sma-v4/schema';
import {toast} from 'react-toastify';
import {
  useCallback,
  useEffect,
  useState,
  useMemo,
} from 'react';
import {useGeolocation} from '@/hooks/Geolocation';
import {useHistory} from 'react-router-dom';
import {useI18n} from '@/hooks/I18n';
import {useParams} from 'react-router-dom';
import {useProfile} from '@/hooks/Profile';
import {z} from 'zod';

import {ellipsisVerticalSharp as MoreVertIcon} from 'ionicons/icons';
import CancelIcon from '@material-symbols/svg-700/sharp/undo.svg';
import ClockIcon  from '@material-symbols/svg-700/sharp/schedule.svg';
import ClockFilledIcon  from '@material-symbols/svg-700/sharp/schedule-fill.svg';
import CloseIcon from '@material-symbols/svg-700/sharp/close.svg';
import LocationMarkerIcon from '@/assets/svg/locationMarker.svg';
import PostLocationIcon from '@material-symbols/svg-400/rounded/location_on-fill.svg';
import StarIcon from '@material-symbols/svg-700/sharp/star.svg';
import StarFilledIcon from '@material-symbols/svg-700/sharp/star-fill.svg';

type PostType  = z.infer<typeof postSchema>;
const defaultLocation: TimestampedLatLng = {lat: 40.78016900410382, lng: -73.96877450706982}; // Delacorte Theater

interface ViewPost {
    source?: string
}

export const ViewPost: React.FC<ViewPost> = ({source}) => {
    const {bundleId, id} = useParams<{bundleId: string, id: string}>();
    const {bundles, posts} = useProfile();
    switch(source){
	case 'bundle':
	    return (bundles[bundleId]
		 && bundles[bundleId].posts
		 && bundles[bundleId].posts[id])
		 ? <PostContent post={bundles[bundleId].posts[id]} />
		 : <PostNotFound />;
	    break;
	default:
	    return posts[id]
		 ? <PostContent post={posts[id]} />
		 : <PostNotFound />;
	    break;
    }
};

const PostNotFound: React.FC = () => <div className='ion-padding'>
    <IonText>
	<h1>
	    <FormattedMessage id='pages.viewPost.notFoundOrNoLongerAvailable' />
	</h1>
    </IonText>
</div>;

type toastError = (
  code: string,
  intl: any // need to pass as argument since this is not a component
) => void;

const toastError: toastError = (code, intl) => {
  switch(code){
    case 'functions/unauthenticated':
      toast.error(intl.formatMessage({id: 'common.errors.unauthenticated'}));
      break;
      // todo: check other cases
    default:
      toast.error(intl.formatMessage({id: 'common.errors.generic'}));
      break;
  }
};

// todo: grab from schema?
interface MoreActionsProps {
  communities: string[],
  evergreen: boolean | undefined,
  feature: boolean | undefined,
  postId: string,
  userId: string
}

const MoreActions: React.FC<MoreActionsProps> = ({
  communities,
  evergreen,
  feature,
  postId,
  userId,
}) => {
  const {
    communities: myCommunities,
    profile,
    user: {uid}
  } = useProfile();
  const history = useHistory();
  const isOwner = uid === userId;
  const isAdmin = communities.filter((c) => profile.private.communities[`community-${c}`] === 'admin').length > 0;
  const intl = useIntl();
  const [presentAlert] = useIonAlert();
  let buttons: ActionSheetButton[] = [];
  const functions = getFunctions();
  const postCloseFunction = httpsCallable(functions, 'post-close');
  const postEvergreenFunction = httpsCallable(functions, 'post-evergreen');
  const postFeatureFunction = httpsCallable(functions, 'post-feature');

  if(isOwner || isAdmin){
    buttons.push({
      handler: () => {
	// todo: add an extra layer of protection?
	presentAlert({
	  header: intl.formatMessage({id: 'common.label.confirm'}),
	  message: intl.formatMessage({id: 'pages.viewPost.confirmClose'}),
	  buttons: [
	    {
	      text: intl.formatMessage({id: 'common.label.no'}),
	      role: 'cancel'
	    },
	    {
	      text: intl.formatMessage({id: 'common.label.yes'}),
	      role: 'confirm',
	      handler: () => {
		postCloseFunction({id: postId})
		  .then(() => {
		    // todo: flashes 404 error before redirecting
		    history.replace('/map');
		    toast.success(intl.formatMessage({id: 'pages.viewPost.postClosed'}));
		  })
		  .catch((error) => {
		    toastError(error.code, intl);
		  });
	      }
	    },
	  ]
	});
      },
      icon: CloseIcon,
      text: intl.formatMessage({id: 'pages.viewPost.close'}),
      role: 'destructive'
    });
  }
  if(isAdmin){
    buttons = buttons.concat([
      {
	handler: () => {
	  const value = !feature;
	  postFeatureFunction({id: postId, value})
	    .then(() => {
	      toast.success(
		value
		? intl.formatMessage({id: 'pages.viewPost.postFeatured'})
		: intl.formatMessage({id: 'pages.viewPost.postUnfeatured'})
	      );
	    }).catch((error) => {
	      toastError(error.code, intl);
	    });
	},
	icon: feature ? StarFilledIcon : StarIcon,
	text: feature
	    ? intl.formatMessage({id: 'pages.viewPost.unfeature'})
	    : intl.formatMessage({id: 'pages.viewPost.feature'}),
      },
      {
	handler: () => {
	  const value = !evergreen;
	  postEvergreenFunction({id: postId, value})
	    .then(() => {
	      toast.success(
		value
		? intl.formatMessage({id: 'pages.viewPost.postEvergreened'})
		: intl.formatMessage({id: 'pages.viewPost.postUnevergreened'})
	      );
	    }).catch((error) => {
	      toastError(error.code, intl);
	    });
	},
	icon: evergreen ? ClockFilledIcon : ClockIcon,
	text: evergreen
	    ? intl.formatMessage({id: 'pages.viewPost.unevergreen'})
	    : intl.formatMessage({id: 'pages.viewPost.evergreen'}),
      },
    ]);
  }
  buttons.push({
    icon: CancelIcon,
    text: intl.formatMessage({id: 'buttons.label.cancel'}),
  });
    return <>
	<IonButton
	  aria-label='more'
	  id='openMoreActions'
	  size='small'
	  fill='clear'
	>
	  <IonIcon
	    aria-hidden='true'
	    slot='icon-only'
	    src={MoreVertIcon}
	  />
	</IonButton>
	<IonActionSheet
	   trigger='openMoreActions'
	   header={intl.formatMessage({id: 'pages.viewPost.moreActions'})}
	   buttons={buttons}
	/>
    </>
    ;
}

const PostContent: React.FC<{post: PostType}> = ({post}) => {
    const functions = getFunctions();
    const logPostViewFunction = httpsCallable(functions, 'user-log-post-view');
    useEffect(() => {
	logPostViewFunction({id: post.id});
    }, []);
  const {
    profile,
    user: {uid}
  } = useProfile();
  const isOwner = uid === post.userId;
  const isAdmin = post.communities.filter((c) => profile.private.communities[`community-${c}`] === 'admin').length > 0;
  const {dateFnsLocale} = useI18n();
  const {communities} = useProfile();
  const {lastGeolocation} = useGeolocation();
  const postCenter: TimestampedLatLng = {
    lat: post.location.lat,
    lng: post.location.lng
  };
  const [center, setCenter] = useState<TimestampedLatLng>(postCenter);
  const changeCenter = useCallback((location: TimestampedLatLng) => {
    setCenter({
      ...location,
      timestamp: new Date()
    });
  }, [setCenter]);
  const [showMap, setShowMap] = useState<boolean>(false);
  const layer: MapLayerProps = useMemo(() => ({
    featureRadius: 20,
    featureWidth: 20,
    fillColor: 'rgba(11, 167, 100, 0.5)',
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
    name: 'marker',
    strokeColor: 'rgba(255, 255, 255, 0.5)',
    type: 'vector'
  }), [post.location.lat, post.location.lng]);
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
  const controls = <div style={{
    display: 'flex',
    flexDirection: 'column',
    position: 'absolute',
    right: '1rem',
    top: '1rem',
    zIndex: 999
  }}>
    <LocateMeControl setCurrentLocation={changeCenter} />
    <IonButton className='square' onClick={() => {changeCenter(postCenter);}}>
      <IonIcon slot='icon-only' src={PostLocationIcon} />
    </IonButton>
  </div>;
  return <>
    <div className='ion-padding'>
      <div style={{display: 'flex'}}>
	<IonText style={{flexGrow: '1', wordWrap: 'anywhere'}}>
	  <h1 className='ion-text-center ion-no-margin'>
	    <span className={classnames({feature: post.feature})}>
	      {post.title}
	    </span>
	  </h1>
	</IonText>
	{(isOwner || isAdmin) &&
	<>
	<MoreActions
	  communities={post.communities}
	  evergreen={post.evergreen}
	  feature={post.feature}
	  postId={post.id}
	  userId={post.userId}
	/>
	</>}
      </div>
      {!post.evergreen
      && <IonGrid>
	  <IonRow>
	      <IonCol size='auto' className='ion-text-right pr-1'>
		  {isPast(post.starts)
		  ? <FormattedMessage id='common.label.started' />
		  : <FormattedMessage id='common.label.starts' />}
		  <br />
		  {isPast(post.ends)
		  ? <FormattedMessage id='common.label.ended' />
		  : <FormattedMessage id='common.label.ends' />}
	      </IonCol>
	      <IonCol>
		  <DateTimeDisplay timestamp={post.starts} />
		  <br />
		  <DateTimeDisplay timestamp={post.ends} />
	      </IonCol>
	  </IonRow>
      </IonGrid>
      }
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
	  center={center}
	  controls={controls}
	  layers={[
	    currentLocationLayer,
	    layer,
	  ]}
	  zoom={14}
	/>
      </div>}
      {post.tags && <div>
	<DietaryTags tags={post.tags} />
      </div>}
      {Object.keys(communities).length > 1 &&
       <div>
	 <CommunityTags communities={post.communities} />
       </div>
      }
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
    </div>
    {post.photos && <IonGrid className='ion-no-padding'>
      <IonRow>
	{post.photos.map((photo) =>
	  <IonCol size='4' key={photo}><Photo
	      path={`/postPhotos/${post.id}-${photo}.png`} /></IonCol>
	)}
      </IonRow>
    </IonGrid>}
    {post.cannotChat !== true
    && <>
      <IonList className='ion-no-padding'>
	<IonListHeader color='dark'>
	  <FormattedMessage id='pages.viewPost.chat' />
	</IonListHeader>
      </IonList>
      <div className='ion-padding'>
	<Chat
	  collection='posts'
	  documentId={post.id}
	/>
      </div>
    </>
    }
  </>;
};
