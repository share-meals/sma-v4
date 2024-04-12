import {FormattedMessage} from 'react-intl';
import {
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
import {useState} from 'react';

import CloseSharpIcon from '@material-design-icons/svg/sharp/close.svg';
import WarningIcon from '@material-design-icons/svg/outlined/warning.svg';


interface props {
  translatedTitle: React.ReactNode
}

export const Header: React.FC<React.PropsWithChildren<props>> = ({
  translatedTitle
}) => {
  const {alerts} = useAlerts();
  const [showAlerts, setShowAlerts] = useState<boolean>(false);
  return <>
    <IonHeader className='ion-no-border' style={{backgroundColor: 'var(--ion-color-primary)'}}>
    <IonToolbar color='primary' className='max-width-md margin-horizontal-auto'>
	<IonTitle>
	  {translatedTitle}{import.meta.env.VITE_ENVIRONMENT !== 'live' && ` [${import.meta.env.VITE_ENVIRONMENT}]`}
	</IonTitle>
	<IonButtons slot='end'>
	  {Object.values(alerts).length > 0 &&
	     <IonButton onClick={() => {setShowAlerts(true);}}>
	       <IonIcon aria-hidden='true' src={WarningIcon} slot='icon-only' />
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
	      <IonIcon src={CloseSharpIcon}/>
	    </IonButton>
	  </IonButtons>
	</IonToolbar>
      </IonHeader>
      <IonContent className='ion-padding'>
	{Object.keys(alerts).map((key) =>
	  <IonItem key={key}>
	    {alerts[key].message}
	  </IonItem>)}	
      </IonContent>
    </IonModal>
  </>;
}
