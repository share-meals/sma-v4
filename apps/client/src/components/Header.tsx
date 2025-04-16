import classnames from 'classnames';
import {FormattedMessage} from 'react-intl';
import {
  IonBackButton,
  IonBadge,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonList,
  IonModal,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import {useAlerts} from '@/hooks/Alerts';
import {useMessages} from '@/hooks/Messages';
import {useProfile} from '@/hooks/Profile';
import {useState} from 'react';

import CloseIcon from '@material-symbols/svg-400/rounded/close.svg';
import WarningIcon from '@material-symbols/svg-400/rounded/warning.svg';
import ChatIcon from '@material-symbols/svg-400/rounded/chat_bubble.svg';


interface props {
  translatedTitle: React.ReactNode
}

export const Header: React.FC<React.PropsWithChildren<props>> = ({
  translatedTitle
}) => {
  const {alerts} = useAlerts();
  const [showAlerts, setShowAlerts] = useState<boolean>(false);
  const {isLoggedIn} = useProfile();
  const {unreadCount} = useMessages();
  return <>
    <IonHeader className='ion-no-border' style={{backgroundColor: 'var(--ion-color-primary)'}}>
      <IonToolbar color='primary' className='max-width-md margin-horizontal-auto'>
	<IonButtons slot="start">
	  <IonBackButton></IonBackButton>
	</IonButtons>
	<IonTitle>
	  {translatedTitle}{import.meta.env.VITE_ENVIRONMENT !== 'live' && ` [${import.meta.env.VITE_ENVIRONMENT}]`}
	</IonTitle>
	<IonButtons slot='end'>
	  {Object.values(alerts).length > 0 &&
	   <IonButton onClick={() => {setShowAlerts(true);}}>
	     <IonIcon aria-hidden='true' src={WarningIcon} slot='icon-only' />
	   </IonButton>
	  }
	  {isLoggedIn &&
	   <IonButton
	     className={classnames({'has-badge': unreadCount > 0})}
	     routerDirection='root'
	     routerLink='/messages/dashboard'>
	     <IonIcon aria-hidden='true' src={ChatIcon} slot='icon-only' />
	     {unreadCount > 0 &&
	      <IonBadge color='light'>
		{unreadCount}
	      </IonBadge>}
	   </IonButton>
	  }
	</IonButtons>
      </IonToolbar>
    </IonHeader>
    <IonModal isOpen={showAlerts} onDidDismiss={() => {setShowAlerts(false);}}>
      <IonHeader className='ion-no-border'>
	<IonToolbar color='primary'>
	  <IonTitle>
	    <FormattedMessage id='components.header.alertsModal' />
	  </IonTitle>
	  <IonButtons slot='end'>
	    <IonButton onClick={() => {setShowAlerts(false);}}>
	      <IonIcon src={CloseIcon}/>
	    </IonButton>
	  </IonButtons>
	</IonToolbar>
      </IonHeader>
      <IonContent className='ion-padding'>
	{Object.keys(alerts).map((key) =>
	  <IonItem key={key}>
	    <FormattedMessage id={alerts[key].message} />
	  </IonItem>)}	
      </IonContent>
    </IonModal>
  </>;
}
