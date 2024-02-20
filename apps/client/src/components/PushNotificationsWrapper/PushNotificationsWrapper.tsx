import {
  Device,
  DeviceInfo
} from '@capacitor/device';
import {
  getMessaging,
  getToken
} from 'firebase/messaging';
import {httpsCallable} from 'firebase/functions';
import {FCM} from '@capacitor-community/fcm';
import {
  PushNotifications
} from '@capacitor/push-notifications';
import {useEffect} from 'react';
import {useFunctions} from 'reactfire';

type sendMessagingToken = (messagingToken: string) => Promise<void>;

export const PushNotificationsWrapper: React.FC<React.PropsWithChildren> = ({children}) => {
  const functions = useFunctions();
  const sendMessagingFunction = httpsCallable(functions, 'user-messagingTokens-create');
  const sendMessagingToken: sendMessagingToken = async (messagingToken) => {
    const device: DeviceInfo = await Device.getInfo();
    /*
    await sendMessagingFunction({
      messagingToken
    });
    */
  }
  
  useEffect(() => {
    (async () => {
      const device: DeviceInfo = await Device.getInfo();
      switch(device.platform){
	case 'web':
	  const messaging = getMessaging();
	  const messagingToken = await getToken(messaging, {vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY});
	  sendMessagingToken(messagingToken);
	  break;
      };
    })()
  }, []);
  return children;
};
