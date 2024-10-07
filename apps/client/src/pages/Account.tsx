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

import CloseIcon from '@material-symbols/svg-400/rounded/close.svg';
import AddIcon from '@material-symbols/svg-400/rounded/add.svg';

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
	      <IonIcon src={CloseIcon}/>
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

type JoinCommunityErrorMessage = 'no new communities to join' | 'no matched communities';

interface JoinCommunityFormProps {
  setHasError: Dispatch<SetStateAction<JoinCommunityErrorMessage | null>>,
  setHasSuccess: Dispatch<SetStateAction<JoinCommunitySuccessMessage[] | null>>
}

const JoinCommunityForm: React.FC<JoinCommunityFormProps> = ({
  setHasError,
  setHasSuccess
}) => {
  const intl = useIntl();
  const functions = getFunctions();
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
    setHasError(null);
    reset();
  });
  const onSubmit = handleSubmit((data) => {
    setIsLoading(true);
    setHasSuccess(null);
    setHasError(null);
    addByCommunityCodeFunction(data)
      .then((response) => {
	    console.log(response);
	setHasSuccess(response.data as JoinCommunitySuccessMessage[]);
	reset();
      })
      .catch((error) => {
	setHasError(error.message);
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
    </form>
  </>;
}

const JoinCommunityByEmailDomain: React.FC<JoinCommunityFormProps> = ({
  setHasError,
  setHasSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const functions = getFunctions();
  const addByEmailDomainFunction = httpsCallable(functions, 'user-community-addByEmailDomain');
  return <>
    <StateButton
      fill='clear'
      isLoading={isLoading}
      onClick={() => {
	setIsLoading(true);
	setHasSuccess(null);
	setHasError(null);
	addByEmailDomainFunction()
	  .then((response) => {
	    setHasSuccess(response.data as JoinCommunitySuccessMessage[]);
	  })
	  .catch((error) => {
	    setHasError(error.message);
	  }).finally(() => {
	    setIsLoading(false);
	  });

//	setIsLoading(false);
      }}
    >
      <FormattedMessage id='pages.account.joinByEmailDomain' />
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
  const [hasError, setHasError] = useState<JoinCommunityErrorMessage | null>(null);
  const [hasSuccess, setHasSuccess] = useState<JoinCommunitySuccessMessage[] | null>(null);
  return <IonModal isOpen={showJoinCommunity} onDidDismiss={() => {
    setHasError(null);
    setHasSuccess(null);
    setShowJoinCommunity(false);
  }}>
    <IonHeader className='ion-no-border'>
      <IonToolbar color='primary'>
	<IonTitle>
	  <FormattedMessage id='pages.account.joinCommunity' />
	</IonTitle>
	<IonButtons slot='end'>
	  <IonButton onClick={() => {setShowJoinCommunity(false);}}>
	    <IonIcon src={CloseIcon}/>
	  </IonButton>
	</IonButtons>
      </IonToolbar>
    </IonHeader>
    <IonContent className='ion-padding'>
  <JoinCommunityForm
  setHasError={setHasError}
  setHasSuccess={setHasSuccess}
  />
      <div className='ion-text-right mt-2'>
	<JoinCommunityByEmailDomain
	  setHasError={setHasError}
	  setHasSuccess={setHasSuccess}
	/>
      </div>
      {hasSuccess !== null
      && <Notice color='success' className='ion-margin'>
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
	    return <IonLabel key={index}>
	      {m}
	    </IonLabel>
	  })}
      </Notice>}

      {hasError !== null
      && <Notice color='danger' className='ion-margin'>
	<IonLabel>
	  {hasError === 'no matched communities' && <FormattedMessage id='common.errors.noCommunitiesFound' />}
	  {hasError === 'no new communities to join' && <FormattedMessage id='common.errors.noNewCommunitiesToJoin' />}
	</IonLabel>
      </Notice>}
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
  const functions = getFunctions();
  const removeFromCommunityFunction = httpsCallable(functions, 'user-community-remove');
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
      <IonItem className='ion-hide' button detail={true} onClick={() => {setShowChangePassword(true);}}>
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
	  <IonIcon slot='icon-only' src={AddIcon} />
	</StateButton>
	</div>
      </IonListHeader>
      <div className='mv-1 ph-1'>
	<CommunityTags communities={Object.keys(communities)} onClose={(communityId) => {
	  removeFromCommunityFunction({communityId})
	    .catch((error) => {
	      console.log(error);
	    });
	}}/>
	{Object.keys(communities).length === 0 && <FormattedMessage id='pages.account.noCommunities' />}
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
	      <IonIcon src={CloseIcon}/>
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
