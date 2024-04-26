import {
  FormattedMessage,
  useIntl
} from 'react-intl';
import {
  Input
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
import {LanguageSwitcher} from '@/components/LanguageSwitcher';
import {useForm} from 'react-hook-form';
import {useLogger} from '@/hooks/Logger';
import {useMessaging} from '@/hooks/Messaging';
import {useProfile} from '@/hooks/Profile';
import {useState} from 'react';
import {userSchema} from '@sma-v4/schema';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';

import CloseSharpIcon from '@material-design-icons/svg/sharp/close.svg';

const DEBUG_TAP_COUNT: number = 7;

/*
const ChangePasswordModal: React.FC = () => {
  const auth = getFirebaseAuth();
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
    <form
      onSubmit={onSubmit}>
      <Input
	control={control}
	disabled={isLoading}
	label={intl.formatMessage({id: 'forms.label.new_password'})}
	name='new_password'
	type='password'
      />
     <Input
	control={control}
	disabled={isLoading}
       label={intl.formatMessage({id: 'forms.label.confirm_new_password'})}
	name='confirm_new_password'
	type='password'
      />
      <Input
	control={control}
	disabled={isLoading}
	label={intl.formatMessage({id: 'forms.label.old_password'})}
	name='old_password'
	type='password'
      />
     </form>
  </>;

};

      <IonButton
	fill='outline'
	onClick={signout}
	slot='end'
      >
      </IonButton>


 */

export const Account: React.FC = () => {
  const [showDebugTaps, setShowDebugTaps] = useState<number>(0);
  const {log, logs} = useLogger();
  const {getMessagingToken} = useMessaging();
  const [messagingToken, setMessagingToken] = useState<string | null>(null);
  const {user, signout} = useProfile();
  const [showLogs, setShowLogs] = useState<boolean>(false);
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
    <IonList>
    <IonItem className='ion-hide'>
      <FormattedMessage id='pages.account.changePassword' />
    </IonItem>
    <IonItem>
      <LanguageSwitcher />
    </IonItem>
    <IonItem button onClick={signoutInternal}>
      <FormattedMessage id='common.label.logout' />
    </IonItem>

    <IonItem className='ion-text-right' onClick={async () => {
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
