import {
  ActionSheetButton,
  IonActionSheet,
  IonButton,
  IonCol,
  IonGrid,
  IonIcon,
  IonItem,
  IonRow,
  IonText,
  useIonAlert,
  useIonViewDidLeave,
  useIonViewWillEnter,
} from '@ionic/react';
import {CollapsibleMap} from '@/components/CollapsibleMap';
import {DateTimeDisplay} from '@/components/DateTimeDisplay';
import {
  FormattedMessage,
  useIntl,
} from 'react-intl';
import {
  getDatabase,
  off,
  onValue,
  ref,
} from 'firebase/database';
import {
  getFunctions,
  httpsCallable,
} from 'firebase/functions';
import {
  Input,
  StateButton
} from '@share-meals/frg-ui';
import {isPast} from 'date-fns';
import {LoadingIndicator} from '@/components/LoadingIndicator';
import {PostNotFound} from '@/components/PostNotFound';
import {
  shareAskSchema,
  shareSchema
} from '@sma-v4/schema';
import {ShareTitle} from '@/components/ShareTitle';
import {StateButtonLoadingIndicator} from '@/components/StateButtonLoadingIndicator';
import {toast} from 'react-toastify';
import {toastError} from '@/utilities/toastError';
import {useForm} from 'react-hook-form';
import {useHistory} from 'react-router-dom';
import {useParams} from 'react-router-dom';
import {useProfile} from '@/hooks/Profile';
import {useState} from 'react';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';

import {ellipsisVerticalSharp as MoreVertIcon} from 'ionicons/icons';
import CancelIcon from '@material-symbols/svg-700/sharp/undo.svg';
import CloseIcon from '@material-symbols/svg-700/sharp/close.svg';


// todo: grab from schema?
interface MoreActionsProps {
  communities: string[],
  postId: string,
  userId: string
}

const MoreActions: React.FC<MoreActionsProps> = ({
  communities,
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

  if(isOwner || isAdmin){
    buttons.push({
      handler: () => {
	// todo: add an extra layer of protection?
	presentAlert({
	  header: intl.formatMessage({id: 'common.label.confirm'}),
	  message: intl.formatMessage({id: 'common.label.confirmClose'}),
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
		    toast.success(intl.formatMessage({id: 'common.toast.postClosed'}));
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
      text: intl.formatMessage({id: 'buttons.label.close'}),
      role: 'destructive'
    });
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


type ShareType = z.infer<typeof shareSchema>;

export const ViewShare: React.FC = () => {
  const {id} = useParams<{id: string}>();
  const {
    posts,
    user: {uid}
  } = useProfile();
  const [givenCount, setGivenCount] = useState<number | undefined>(undefined);
  const [didIAsk, setDidIAsk] = useState<boolean | undefined>(undefined);
  const db = getDatabase();
  const givenCountRef = ref(db, `/shares/${id}/givenCount`);
  const didIAskRef = ref(db, `/shares/${id}/asks/${uid}`);
  useIonViewWillEnter(() => {
    onValue(didIAskRef, (snapshot) => {
      setDidIAsk(snapshot.val() !== null);
    });
    onValue(givenCountRef, (snapshot) => {
      console.log(snapshot.val());
      setGivenCount(snapshot.val() || 0);
    });
  });
  useIonViewDidLeave(() => {
    off(didIAskRef);
    off(givenCountRef);
  });
  if(posts[id]){
    if(givenCount === undefined
    || didIAsk === undefined){
      return <div style={{height: 'calc(100vh - 113px)'}}>
	<LoadingIndicator />
      </div>;
    }
    if(posts[id].swipes <= (givenCount || 0)){
      return <PostNotFound />;
    }
    return <ShareContent share={posts[id]} didIAsk={didIAsk} />;
  }else{
    return <PostNotFound />;
  }
};

const ShareContent: React.FC<{didIAsk: boolean, share: ShareType}> = ({
  didIAsk,
  share
}) => {
  const intl = useIntl();
  const {
    profile,
    user: {uid}
  } = useProfile();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const isOwner = uid === share.userId;
  const isAdmin = share.communities.filter((c) => profile.private.communities[`community-${c}`] === 'admin').length > 0;
  const {
    control,
    handleSubmit,
  } = useForm({
    mode: 'onSubmit',
    resolver: zodResolver(
      shareAskSchema.pick({
	message: true
      })
    ),
    reValidateMode: 'onSubmit'
  });
  const functions = getFunctions();
  const askFunction = httpsCallable(functions, 'share-ask');
  const onSubmit = handleSubmit(({message}) => {
    setIsLoading(true);
    askFunction({
      postId: share.id,
      message
    })
      .then(() => {
	toast.success(intl.formatMessage({id: 'pages.viewShare.asked'}));

      })
      .catch((error) => {
	console.log(error);
      }).finally(() => {
	setIsLoading(false);
      });
  });
  return <>
    <div className='ion-padding'>
      <div style={{display: 'flex'}}>
	<IonText style={{flexGrow: '1', wordWrap: 'anywhere'}}>
	  <h1 className='ion-text-center ion-no-margin'>
	    <ShareTitle
	      element='h1'
	      swipes={share.swipes}
	      userId={share.userId}
	    />
	  </h1>
	</IonText>
	{(isOwner || isAdmin) &&
	<>
	<MoreActions
	  communities={share.communities}
	  postId={share.id}
	  userId={share.userId}
	/>
	</>}
      </div>
      <IonGrid>
	  <IonRow>
	      <IonCol size='auto' className='ion-text-right pr-1'>
		  {isPast(share.starts)
		  ? <FormattedMessage id='common.label.started' />
		  : <FormattedMessage id='common.label.starts' />}
		  <br />
		  {isPast(share.ends)
		  ? <FormattedMessage id='common.label.ended' />
		  : <FormattedMessage id='common.label.ends' />}
	      </IonCol>
	      <IonCol>
		  <DateTimeDisplay timestamp={share.starts} />
		  <br />
		  <DateTimeDisplay timestamp={share.ends} />
	      </IonCol>
	  </IonRow>
      </IonGrid>
      <CollapsibleMap {...share.location} />
      <div className='mt-2'>
	{
	  share.userId === uid &&
	  <div className='ion-text-center'>
	    <FormattedMessage id='pages.viewShare.thisIsYours' />
	  </div>
	}
	{
	  share.userId !== uid && didIAsk &&
	  <div className='ion-text-center'>
	    <FormattedMessage id='pages.viewShare.youAlreadyAsked' />
	  </div>
	}
	{
	  share.userId !== uid && !didIAsk &&

	  <>
	  <form
	      noValidate
	      onSubmit={onSubmit}>
	    <IonItem
	      className='input-button'
	      lines='none'
	    >
	    <Input
	      control={control}
	      disabled={isLoading}
	      fill='outline'
	      helperText={intl.formatMessage({id: 'pages.viewShare.askExplanation'})}
	      label={intl.formatMessage({id: 'common.label.message'})}
	      labelPlacement='floating'
	      name='message'
	      required={true}
	    />
	    <StateButton
	      isLoading={isLoading}
	      size='large'
	      slot='end'
	      loadingIndicator={<StateButtonLoadingIndicator />}
	      type='submit'>
	      <FormattedMessage id ='pages.viewShare.ask' />
	    </StateButton>
	    </IonItem>
	  </form>
	  </>
	}
      </div>
    </div>
  </>;
};
