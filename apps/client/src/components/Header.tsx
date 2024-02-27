import {FormattedMessage} from 'react-intl';
import {
  IonBackButton,
  IonButtons,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/react';

interface props {
  translatedTitle: React.ReactNode
}

export const Header: React.FC<React.PropsWithChildren<props>> = ({
  translatedTitle
}) => {
  return <IonHeader className='ion-no-border'>
    <IonToolbar color='primary'>
      <div className='max-width-md margin-horizontal-auto'>
	<IonButtons slot='end'>
	  <IonBackButton />
	</IonButtons>
	<IonTitle>
	  {translatedTitle}{import.meta.env.VITE_ENVIRONMENT !== 'live' && ` [${import.meta.env.VITE_ENVIRONMENT}]`}
	</IonTitle>
      </div>
    </IonToolbar>
  </IonHeader>;
}
