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
} from '@ionic/react';
import {Chat} from '@/components/Chat';
import classnames from 'classnames';
import {CollapsibleMap} from '@/components/CollapsibleMap';
import {CommunityTags} from '@/components/CommunityTags';
import {DateTimeDisplay} from '@/components/DateTimeDisplay';
import {DietaryTags} from '@/components/DietaryTags';
import {ExternalLink} from '@/components/ExternalLink';
import {
  FormattedMessage,
  useIntl
} from 'react-intl';
import {
  getFunctions,
  httpsCallable,
} from 'firebase/functions';
import {isPast} from 'date-fns';
import Markdown from 'react-markdown';
import {Photo} from '@/components/Photo';
import {PostNotFound} from '@/components/PostNotFound';
import {postSchema} from '@sma-v4/schema';
import {toast} from 'react-toastify';
import {toastError} from '@/utilities/toastError';
import {useEffect} from 'react';
import {useHistory} from 'react-router-dom';
import {useParams} from 'react-router-dom';
import {useProfile} from '@/hooks/Profile';
import {z} from 'zod';

import {ellipsisVerticalSharp as MoreVertIcon} from 'ionicons/icons';
import CancelIcon from '@material-symbols/svg-700/sharp/undo.svg';
import ClockIcon  from '@material-symbols/svg-700/sharp/schedule.svg';
import ClockFilledIcon  from '@material-symbols/svg-700/sharp/schedule-fill.svg';
import CloseIcon from '@material-symbols/svg-700/sharp/close.svg';
import StarIcon from '@material-symbols/svg-700/sharp/star.svg';
import StarFilledIcon from '@material-symbols/svg-700/sharp/star-fill.svg';

type PostType = z.infer<typeof postSchema>;

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
	  message: intl.formatMessage({id: 'common.label.confirmClose'}),
	  buttons: [
	    {
	      htmlAttributes: {
		'data-testid': 'pages.viewPost.closePost.confirm.no.button'
	      },
	      role: 'cancel',
	      text: intl.formatMessage({id: 'common.label.no'}),
	    },
	    {
	      handler: () => {
		postCloseFunction({id: postId})
		  .then(() => {
		    // todo: flashes 404 error before redirecting
		    history.replace('/map');
		    toast.success(intl.formatMessage({id: 'common.toast.postClosed'}));
		  })
		  .catch((error) => {
		    toastError(error.code, intl);
		  });
	      },
	      htmlAttributes: {
		'data-testid': 'pages.viewPost.closePost.confirm.yes.button'
	      },
	      role: 'confirm',
	      text: intl.formatMessage({id: 'common.label.yes'}),
	    },
	  ]
	});
      },
      icon: CloseIcon,
      text: intl.formatMessage({id: 'buttons.label.close'}),
      role: 'destructive',
      htmlAttributes: {
	'data-testid': 'pages.viewPost.moreActionsSheet.close.button'
      }
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
	  aria-label={intl.formatMessage({id: 'common.openMoreActions.button.ariaLabel'})}
	  data-testid='pages.viewPost.openMoreActions.button'
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
	   header={intl.formatMessage({id: 'common.moreActions.actionSheet.title'})}
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
  const {communities} = useProfile();
  const postCanChat = post.canChat === undefined ? true : post.canChat;
  const communitiesCanChat = Object.values(communities).reduce(
    // TODO: using any for community because features should be defined at this point, not allowed to be undefined
    (accumulator: boolean, community: any) => (
      accumulator && community.features.canChat
    ), true);
  const canChat = postCanChat && communitiesCanChat;
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
      {
	post.location.lat !== -999
	&& post.location.lng !== -999
	&& <CollapsibleMap {...post.location} />
      }
      {
	post.location.lat === -999
	&& post.location.lng === -999
	&& <>
	  <FormattedMessage id='common.label.link' />
	&nbsp;
	<ExternalLink value={post.location.address} />
	</>
      }
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
    {canChat
    && <>
      <IonList className='ion-no-padding' role='presentation'>
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
