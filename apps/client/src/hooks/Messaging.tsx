import {Capacitor} from '@capacitor/core';
import {
  createContext,
  useCallback,
  useContext,
} from 'react';
import {Device} from '@capacitor/device';
import difference from 'lodash/difference';
import {
  FirebaseMessaging,
  GetTokenOptions,
} from '@capacitor-firebase/messaging';
import {
  FormattedMessage,
  useIntl,
} from 'react-intl';
import {
  getFunctions,
  httpsCallable,
} from 'firebase/functions';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonModal,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import isEqual from 'lodash/isEqual';
import {toast} from 'react-toastify';
import {useAlerts} from '@/hooks/Alerts';
import {
  useRef,
  useState,
} from 'react';
import {useLogger} from '@/hooks/Logger';

import CloseSharpIcon from '@material-design-icons/svg/sharp/close.svg';

interface MessagingState {
  enable: () => Promise<void>,
  sendMessagingToken: () => Promise<void>,
  clearMessagingToken: (uid: string) => Promise<void>,
  getMessagingToken: () => Promise<string>,
  updateCommunitySubscriptions: (fixedCommunityIds: string[] | null) => Promise<void>,
}

const MessagingContext = createContext<MessagingState>({} as MessagingState);

export const useMessaging = () => useContext(MessagingContext);

const functions = getFunctions();
const userMessagingTokenCreateFunction = httpsCallable(functions, 'user-messagingToken-create');
const userMessagingTokenDeleteFunction = httpsCallable(functions, 'user-messagingToken-delete');
const userCommunitySubscribeFunction = httpsCallable(functions, 'user-community-subscribe');
const userCommunityUnsubscribeFunction = httpsCallable(functions, 'user-community-unsubscribe');

export const MessagingProvider: React.FC<React.PropsWithChildren> = ({children}) => {
  const [permission, setPermission] = useState<'prompt' | 'prompt-with-rationale' | 'granted' | 'denied' | null>(null);
  const [needPrompt, setNeedPrompt] = useState<boolean>(false);
  const subscribedCommunities = useRef<string[] | null>(null);
  const {addAlert} = useAlerts();
  const {log} = useLogger();
  const intl = useIntl();
  
  const checkPermission = useCallback(async () => {
    const {receive: existingPermission} = await FirebaseMessaging.checkPermissions();
    setPermission(existingPermission);
    log({
      level: 'debug',
      component: 'messaging',
      message: `permission level ${existingPermission}`
    });
    return existingPermission;
  }, []);
  
  // prompt if needed
  // set alert if needed
  const enable = useCallback(async () => {
    // check permission if don't know it
    const p = permission === null ? await checkPermission() : permission;
    log({
      level: 'debug',
      component: 'messaging',
      message: `enable with permission level ${p}`
    });
    switch(p){
      case 'prompt':
      case 'prompt-with-rationale':
	setNeedPrompt(true);
	break;
      case 'granted':
	// remove any existing listeners to prevent buggy behavior
	FirebaseMessaging.removeAllListeners()
			 .then(() => {
			   FirebaseMessaging.addListener('notificationReceived', (event) => {
			     // todo: toast a message and have it clickable / redirectable
			     console.log(JSON.stringify(event));
			   });
			 });
	// todo: remove alert if exists
	break;
      case 'denied':
	addAlert('messaging', {message: 'errors.messaging.denied'});
	break;
    }
  }, [addAlert]);

  const sendMessagingToken = useCallback(async () => {
    log({
      level: 'debug',
      component: 'messaging',
      message: `sending messaging token`
    });
    const messagingToken = await getMessagingToken();
    const device = await Device.getInfo();
    userMessagingTokenCreateFunction({
      messagingToken,
      platform: device.platform
    });
  }, []);

  // need to pass userId since likely to be called on logout
  // and cannot access Profile context
  const clearMessagingToken = useCallback(async (userId: string) => {
    log({
      level: 'debug',
      component: 'messaging',
      message: `clearing messaging token`
    });
    const messagingToken = await getMessagingToken();
    userMessagingTokenDeleteFunction({messagingToken});
  }, []);

  const subUnsubCommunities = useCallback(async (fixedCommunityIds: string[], action: 'subscribe' | 'unsubscribe') => {
    const p = await checkPermission();
    const messagingToken = await getMessagingToken();

    if(p === 'denied'){
      // if we don't have permissions, then exit early
      return;
    }
    
    switch(action){
      case 'subscribe':
	log({
	  level: 'debug',
	  component: 'messaging',
	  message: `subscribing to ${JSON.stringify(fixedCommunityIds)}`
	});
	if(Capacitor.isNative){
	  const tasks: Promise<void>[] = [];
	  for(const c of fixedCommunityIds){
	    tasks.push(FirebaseMessaging.subscribeToTopic({topic: c}));
	  }
	}else{
	  userCommunitySubscribeFunction({messagingToken, communityIds: fixedCommunityIds});
	}
	break;
      case 'unsubscribe':
	log({
	  level: 'debug',
	  component: 'messaging',
	  message: `unsubscribing to ${JSON.stringify(fixedCommunityIds)}`
	});
	if(Capacitor.isNative){
	  const tasks: Promise<void>[] = [];
	  for(const c of fixedCommunityIds){
	    tasks.push(FirebaseMessaging.unsubscribeFromTopic({topic: c}));
	  }
	  await Promise.all(tasks);
	}else{
	  userCommunityUnsubscribeFunction({messagingToken, communityIds: fixedCommunityIds});
	}
	break;
      default:
	// should never reach here
	break;
    }
  }, []);

  const updateCommunitySubscriptions = useCallback(async (fixedCommunityIds: string[] | null) => {
    if(fixedCommunityIds !== null){
      // potentially need to subscribe and unsubscribe
      //const fixedCommunityIds = communityIds.map((c) => `community-${c}`);
      if(!isEqual(fixedCommunityIds, subscribedCommunities.current)){
	// unsubscribe from old communities
	const removedCommunityIds = difference(subscribedCommunities.current, fixedCommunityIds ?? []);
	if(removedCommunityIds.length > 0){
	  subUnsubCommunities(removedCommunityIds, 'unsubscribe');
	}
	// subscribe to new communities
	const newCommunityIds = difference(fixedCommunityIds, subscribedCommunities.current ?? []);
	if(newCommunityIds.length > 0){
	  subUnsubCommunities(newCommunityIds, 'subscribe');
	}
	// update community tracking
	subscribedCommunities.current = fixedCommunityIds;
      }
    }
    
    if(fixedCommunityIds === null && subscribedCommunities.current !== null){
      // need to unsubscribe from all
      subUnsubCommunities(subscribedCommunities.current, 'unsubscribe');
      subscribedCommunities.current = null;
    }
  }, [subscribedCommunities]);

  const getMessagingToken = useCallback(async () => {
    // todo: error handling
    const options: GetTokenOptions = {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
    };

    // todo: needed?
    /*
       if (Capacitor.getPlatform() === 'web') {
       options.serviceWorkerRegistration =
       await navigator.serviceWorker.register('firebase-messaging-sw.js');
       }
     */
    
    const {token} = await FirebaseMessaging.getToken(options);
    return token;
  }, []);

  const requestPermission = useCallback(async () => {
    await FirebaseMessaging.requestPermissions();
    // only gets called from modal
    // and modal only gets opened from enable
    // so try to enable again
    enable();
    setNeedPrompt(false);
  }, []);
  
  return <MessagingContext.Provider
	   value={{
	     clearMessagingToken,
	     enable,
	     getMessagingToken,
	     sendMessagingToken,
	     updateCommunitySubscriptions
	   }}>
    <IonModal isOpen={needPrompt} onDidDismiss={requestPermission}>
      <IonHeader className='ion-no-border'>
	<IonToolbar color='primary'>
	  <IonTitle>
	    <FormattedMessage id='messaging.prompt.title' />
	  </IonTitle>
	  <IonButtons slot='end'>
	    <IonButton onClick={() => {setNeedPrompt(false);}}>
	      <IonIcon src={CloseSharpIcon}/>
	    </IonButton>
	  </IonButtons>
	</IonToolbar>
      </IonHeader>
      <IonContent className='ion-padding'>
	<IonText>
	  <p>
	    <FormattedMessage id='messaging.prompt.text' />
	  </p>
	</IonText>
      </IonContent>
    </IonModal>
    {children}
  </MessagingContext.Provider>
}
