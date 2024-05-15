import {auth} from '@/components/Firebase';
import {
  communityCodeSchema,
  userSchema
} from '@sma-v4/schema';
import {CommunityTags} from '@/components/CommunityTags';
import {
  Dispatch,
  SetStateAction,
  useState
} from 'react';
import {
  FormattedMessage,
  useIntl
} from 'react-intl';
import {
  getFunctions,
  httpsCallable,
} from 'firebase/functions';
import {
  Input,
  StateButton,
} from '@share-meals/frg-ui';
import {
  IonButton,
  IonButtons,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonModal,
  IonRow,
  IonTitle,
  IonToolbar,
  useIonViewDidLeave
} from '@ionic/react';
import {LanguageSwitcher} from '@/components/LanguageSwitcher';
import {Notice} from '@/components/Notice';
import {useForm} from 'react-hook-form';
import {useLogger} from '@/hooks/Logger';
import {useMessaging} from '@/hooks/Messaging';
import {useProfile} from '@/hooks/Profile';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';

import CloseSharpIcon from '@material-design-icons/svg/sharp/close.svg';
import AddSharpIcon from '@material-design-icons/svg/sharp/add.svg';

const DEBUG_TAP_COUNT: number = 7;

interface ChangePasswordModalProps {
  setShowChangePassword: Dispatch<SetStateAction<boolean>>,
  showChangePassword: boolean,
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  setShowChangePassword,
  showChangePassword,
}) => {
  const intl = useIntl();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const {
    control,
    handleSubmit
  } = useForm({
    defaultValues: {},
    mode: 'onBlur',
    resolver: zodResolver(
      userSchema.pick({
	password: true
      })
    )
  });

  const onSubmit = handleSubmit(async (data) => {
    console.log(data);
  });

  return <>
    <IonModal isOpen={showChangePassword} onDidDismiss={() => {setShowChangePassword(false);}}>
      <IonHeader className='ion-no-border'>
	<IonToolbar color='primary'>
	  <IonTitle>
	    <FormattedMessage id='pages.account.changePassword' />
	  </IonTitle>
	  <IonButtons slot='end'>
	    <IonButton onClick={() => {setShowChangePassword(false);}}>
	      <IonIcon src={CloseSharpIcon}/>
	    </IonButton>
	  </IonButtons>
	</IonToolbar>
      </IonHeader>
      <IonContent className='ion-padding'>
	<form
	  onSubmit={onSubmit}>
	  <Input
	    control={control}
	    disabled={isLoading}
	    fill='outline'
	    label={intl.formatMessage({id: 'pages.account.newPassword'})}
	    labelPlacement='floating'
	    name='newPassword'
	    required={true}
	    type='password'
	  />
	  <Input
	    control={control}
	    disabled={isLoading}
	    fill='outline'
	    label={intl.formatMessage({id: 'pages.account.confirmNewPassword'})}
	    labelPlacement='floating'
	    name='confirmNewPassword'
	    required={true}
	    type='password'
	  />
	  <Input
	    control={control}
	    disabled={isLoading}
	    fill='outline'
	    label={intl.formatMessage({id: 'pages.account.currentPassword'})}
	    labelPlacement='floating'
	    name='currentPassword'
	    required={true}
	    type='password'
	  />
	  <div className='ion-padding-top ion-text-center'>
	    <StateButton
	      data-testid='button-change-passwordsubmit'
	      isLoading={isLoading}
	      type='submit'>
	      <FormattedMessage id='buttons.label.submit' />
	    </StateButton>
	  </div>
	</form>
      </IonContent>
    </IonModal>
  </>;
};

interface JoinCommunitySuccessMessage {
  code: string,
  communityId: string,
  communityName: string,
  level: 'admin' | 'member'
}

const JoinCommunityForm: React.FC = () => {
  const intl = useIntl();
  const functions = getFunctions();
  const [hasError, setHasError] = useState<boolean>(false);
  const [hasSuccess, setHasSuccess] = useState<JoinCommunitySuccessMessage[] | null>(null);
  const addByCommunityCodeFunction = httpsCallable(functions, 'user-community-addByCommunityCode');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const {
    control,
    formState,
    handleSubmit,
    reset
  } = useForm({
    mode: 'onSubmit',
    resolver: zodResolver(
      z.object({
	communityCode: communityCodeSchema
      })
    ),
    reValidateMode: 'onSubmit'
  });
  useIonViewDidLeave(() => {
    setHasSuccess(null);
    setHasError(false);
    reset();
  });
  const onSubmit = handleSubmit(async (data) => {
    setIsLoading(true);
    setHasSuccess(null);
    setHasError(false);
    addByCommunityCodeFunction(data)
      .then((response) => {
	setHasSuccess(response.data as JoinCommunitySuccessMessage[]);
	reset();
      })
      .catch((error) => {
	setHasError(true);
	console.log(error);
      }).finally(() => {
	setIsLoading(false);
      });
  });
  return <>
    <form
      noValidate
      onSubmit={onSubmit}>
      <IonGrid>
	<IonRow className='ion-align-items-top'>
	  <IonCol>
	    <Input
	      control={control}
	      data-testid='addCommunity-input-communityCode'
	      disabled={isLoading}
	      fill='outline'
	      label={intl.formatMessage({id: 'common.label.communityCode'})}
	      labelPlacement='floating'
	      name='communityCode'
	      required={true}
	      type='text'
	    />
	  </IonCol>
	  <IonCol size='auto'>
	    <StateButton
	      isLoading={isLoading}
	      style={{marginTop: 10}}
	      type='submit'>
	      <FormattedMessage id='pages.account.join' />
	    </StateButton>
	  </IonCol>
	</IonRow>
      </IonGrid>
      {hasSuccess !== null
      && <Notice color='success' className='ion-margin'>
	<IonLabel>
	  {hasSuccess.map((m) => {
	    switch(m.level){
	      case 'admin':
		return <FormattedMessage
			 id='pages.account.addedCommunity.asAdmin'
			 values={{communityName: m.communityName}} />;
		break;
	      case 'member':
	      default:
		return <FormattedMessage
			 id='pages.account.addedCommunity.asMember'
			 values={{communityName: m.communityName}} />;
		break;
	    }
	  }).map((m, index) => {
	    return <div key={index}>
	      {m}
	    </div>
	  })}
	</IonLabel>
      </Notice>}
      
      {hasError
      && <Notice color='danger' className='ion-margin'>
	<IonLabel>
	  <FormattedMessage id='common.errors.noCommunitiesFound' />
	</IonLabel>
      </Notice>}
    </form>
  </>;
}

const JoinCommunityByEmailAddress: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const joinCommunityByEmailAddress = () => {
    setIsLoading(true);
    // make call
    // display image if needed
    
  };
  return <>
    <StateButton
      isLoading={isLoading}
      onClick={joinCommunityByEmailAddress}
    >
      Join by Your Email Address
    </StateButton>
  </>;
}

interface JoinCommunityModalProps {
  setShowJoinCommunity: Dispatch<SetStateAction<boolean>>,
  showJoinCommunity: boolean,
}

const JoinCommunityModal: React.FC<JoinCommunityModalProps> = ({
  setShowJoinCommunity,
  showJoinCommunity
}) => {
  return <IonModal isOpen={showJoinCommunity} onDidDismiss={() => {setShowJoinCommunity(false);}}>
    <IonHeader className='ion-no-border'>
      <IonToolbar color='primary'>
	<IonTitle>
	  <FormattedMessage id='pages.account.joinCommunity' />
	</IonTitle>
	<IonButtons slot='end'>
	  <IonButton onClick={() => {setShowJoinCommunity(false);}}>
	    <IonIcon src={CloseSharpIcon}/>
	  </IonButton>
	</IonButtons>
      </IonToolbar>
    </IonHeader>
    <IonContent className='ion-padding'>
      <JoinCommunityForm />
      <span className='ion-hide'>
      <div className='ion-text-center mv-1'>
	or
      </div>
      <div className='ion-text-center'>
	<JoinCommunityByEmailAddress />
      </div>
      </span>
    </IonContent>
  </IonModal>
}

export const Account: React.FC = () => {
  const [showDebugTaps, setShowDebugTaps] = useState<number>(0);
  const {log, logs} = useLogger();
  const {getMessagingToken} = useMessaging();
  const [messagingToken, setMessagingToken] = useState<string | null>(null);
  const {communities, user, signout} = useProfile();
  const [showLogs, setShowLogs] = useState<boolean>(false);
  const [showChangePassword, setShowChangePassword] = useState<boolean>(false);
  const [showJoinCommunity, setShowJoinCommunity] = useState<boolean>(false);
  useIonViewDidLeave(() => {
    setShowDebugTaps(0);
  });
  const signoutInternal = () => {
    log({
      component: 'account',
      level: 'debug',
      message: 'logout'
    });
    signout();
  };
  const showLogsModal = async () => {
    setShowLogs(true);
  };

  return <>
    <IonList className='ion-no-padding'>
      <IonListHeader color='dark'>
	<FormattedMessage id='pages.account.settings' />
      </IonListHeader>
      <IonItem button detail={true} onClick={() => {setShowChangePassword(true);}}>
	<FormattedMessage id='pages.account.changePassword' />
      </IonItem>
      <IonItem>
	<LanguageSwitcher />
      </IonItem>
      <IonListHeader color='dark'>
	<div className='ion-align-items-center ion-justify-content-between' style={{display: 'flex', width: '100%'}}>
	  
	<FormattedMessage id='common.label.communities' />
	<StateButton
	  color='light'
	  fill='outline'
	  onClick={() => {setShowJoinCommunity(true);}}>
	  <IonIcon slot='icon-only' src={AddSharpIcon} />
	</StateButton>
	</div>
      </IonListHeader>
      <div className='mv-1 ph-1'>
	<CommunityTags communities={Object.keys(communities)} onClose={(communityId) => {
	  console.log(communityId);
	  // remove user from communityId
	}}/>
      </div>
      <IonListHeader color='dark'>
      </IonListHeader>
      <IonItem button detail={true} onClick={signoutInternal}>
	<FormattedMessage id='common.label.logout' />
      </IonItem>

      <IonItem className='ion-text-right mt-3' lines='none' onClick={async () => {
	if(showDebugTaps < DEBUG_TAP_COUNT){
	  setShowDebugTaps(showDebugTaps + 1);
	  if(showDebugTaps === DEBUG_TAP_COUNT - 1){
	    setMessagingToken(await getMessagingToken());
	  }
	}
      }}>
	<IonLabel className='no-select'>
	  <FormattedMessage id='pages.account.version' values={{version: import.meta.env.VITE_APP_VERSION}}/>
	</IonLabel>
      </IonItem>
      {showDebugTaps >= DEBUG_TAP_COUNT && <>
	<IonListHeader color='dark'>
	  <FormattedMessage id='pages.account.debug' />
	</IonListHeader>
	<IonItem>
	  <IonLabel>
	    <strong><FormattedMessage id='pages.account.userId' /></strong>
	    <br />
	    {user.uid}
	  </IonLabel>
	</IonItem>
	<IonItem>
	  <IonLabel>
	    <strong><FormattedMessage id='pages.account.messagingToken' /></strong>
	    <br />
	    {messagingToken}
	  </IonLabel>
	</IonItem>
	<IonItem button onClick={showLogsModal}>
	  <FormattedMessage id='pages.account.showLogs' />
	</IonItem>
      </>}
    </IonList>
    <ChangePasswordModal {...{showChangePassword, setShowChangePassword}}/>
    <JoinCommunityModal {...{showJoinCommunity, setShowJoinCommunity}}/>
    <IonModal isOpen={showLogs} onDidDismiss={() => {setShowLogs(false);}}>
      <IonHeader className='ion-no-border'>
	<IonToolbar color='primary'>
	  <IonTitle>
	    <FormattedMessage id='pages.account.logsModal' />
	  </IonTitle>
	  <IonButtons slot='end'>
	    <IonButton onClick={() => {setShowLogs(false);}}>
	      <IonIcon src={CloseSharpIcon}/>
	    </IonButton>
	  </IonButtons>
	</IonToolbar>
      </IonHeader>
      <IonContent className='ion-padding'>
	{showLogs &&
	 logs.map((l) => <p key={l.timestamp.toString()}><code>{l.level}|{l.timestamp.toString()}|{l.component}|{l.message}</code></p>)}
      </IonContent>
    </IonModal>
  </>;
};
