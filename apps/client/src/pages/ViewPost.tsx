import {
  ActionSheetButton,
  IonActionSheet,
  IonButton,
  IonCol,
  IonGrid,
  IonIcon,
  IonRow,
  IonText,
  useIonAlert,
  useIonViewWillEnter,
} from '@ionic/react';
import classnames from 'classnames';
import {CommunityTags} from '@/components/CommunityTags';
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
import {Map} from '@/components/Map';
import {MapLayer} from '@share-meals/frg-ui';
import Markdown from 'react-markdown';
import {postSchema} from '@sma-v4/schema';
import {toast} from 'react-toastify';
import {useHistory} from 'react-router-dom';
import {useI18n} from '@/hooks/I18n';
import {useParams} from 'react-router-dom';
import {useProfile} from '@/hooks/Profile';
import {
  useState,
  useMemo,
} from 'react';
import {z} from 'zod';

import {ellipsisVerticalSharp as MoreVertIcon} from 'ionicons/icons';
import LocationIcon from '@material-symbols/svg-700/rounded/location_on-fill.svg';
import CancelIcon from '@material-symbols/svg-700/sharp/undo.svg';
import ClockIcon  from '@material-symbols/svg-700/sharp/schedule.svg';
import ClockFilledIcon  from '@material-symbols/svg-700/sharp/schedule-fill.svg';
import CloseIcon from '@material-symbols/svg-700/sharp/close.svg';
import StarIcon from '@material-symbols/svg-700/sharp/star.svg';
import StarFilledIcon from '@material-symbols/svg-700/sharp/star-fill.svg';

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
  const {communities: myCommunities, user: {uid}} = useProfile();
  const history = useHistory();
  const isOwner = uid === userId;
  const isAdmin = communities.filter((c) => myCommunities[c]?.myMembership === 'admin').length > 0;
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
	handler: () => {
	  console.log('cancel');
	},
	icon: CancelIcon,
	text: intl.formatMessage({id: 'buttons.label.cancel'}),
  });
  return <IonActionSheet
	   trigger='openMoreActions'
	   header={intl.formatMessage({id: 'pages.viewPost.moreActions'})}
	   buttons={buttons}
  />;
}

const PostContent: React.FC<{post: Post}> = ({post}) => {
  console.log(post);
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
    <div style={{display: 'flex'}}>
    <IonText style={{flexGrow: '1'}}>
      <h1 className='ion-text-center ion-no-margin'>
	<span className={classnames({feature: post.feature})}>
	  {post.title}
	</span>
      </h1>
    </IonText>
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
    <MoreActions
      communities={post.communities}
      evergreen={post.evergreen}
      feature={post.feature}
      postId={post.id}
      userId={post.user_id}
    />
    </div>
    {!post.evergreen
    && <p>
      {isPast(post.starts)
      ? <FormattedMessage id='common.label.started' />
      : <FormattedMessage id='common.label.starts' />} {format(post.starts, 'PPpp', {locale: dateFnsLocale})}
      <br />
      {isPast(post.ends)
      ? <FormattedMessage id='common.label.ended' />
      : <FormattedMessage id='common.label.ends' />} {format(post.ends, 'PPpp', {locale: dateFnsLocale})}
    </p>
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
