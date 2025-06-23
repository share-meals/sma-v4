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
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonModal,
  IonTitle,
  IonToolbar,
  useIonViewDidLeave
} from '@ionic/react';
import {JoinCommunityModal} from './JoinCommunity';
import {LanguageSwitcher} from '@/components/LanguageSwitcher';
import {useForm} from 'react-hook-form';
import {useLogger} from '@/hooks/Logger';
import {useMessaging} from '@/hooks/Messaging';
import {useProfile} from '@/hooks/Profile';
import {userSchema} from '@sma-v4/schema';
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
    setIsLoading(true);
    console.log(data);
    setIsLoading(false);
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

export const Account: React.FC = () => {
  const intl = useIntl();
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
    <IonListHeader color='dark'>
      <FormattedMessage id='pages.account.settings' />
    </IonListHeader>
    <IonItem className='ion-hide' button detail={true} onClick={() => {setShowChangePassword(true);}}>
      <IonLabel>
	<FormattedMessage id='pages.account.changePassword' />
      </IonLabel>
    </IonItem>
    <IonItem>
      <LanguageSwitcher />
    </IonItem>
    <IonList className='ion-no-padding'>
      <IonItem color='dark' lines='none'>
	<IonLabel>
	  <FormattedMessage id='common.label.communities' />
	</IonLabel>
	<IonButtons slot='end'>
	  <StateButton
	    aria-label={intl.formatMessage({id: 'xxx'})}
	    color='light'
	    data-testid='pages.account.showJoinCommunity.button'
	    fill='outline'
	    onClick={() => {setShowJoinCommunity(true);}}>
	    <IonIcon
	      aria-label={intl.formatMessage({id: 'xxx'})}
	      slot='icon-only' src={AddIcon} />
	  </StateButton>
	</IonButtons>
      </IonItem>
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
      <IonItem
	button
	data-testid='pages.account.logout.button'
	detail={true}
	onClick={signoutInternal}>
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
