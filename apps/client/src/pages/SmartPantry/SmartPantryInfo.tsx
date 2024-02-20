import {FormattedMessage} from 'react-intl';
import {
  IonCol,
  IonGrid,
  IonImg,
  IonRow,
  IonText
} from '@ionic/react';

import SmartPantrySVG from '@/assets/svg/sp_logo.svg';

export const SmartPantryInfo: React.FC = () => {
  return <IonGrid>
    <IonRow>
      <IonCol>
	<IonImg
	className='animate-wind'
	  src={SmartPantrySVG}
	  style={{width: '75%', margin: 'auto'}} />
      </IonCol>
      <IonCol>
	<IonText>
	  <p>
	    <FormattedMessage
	      id='pages.smartPantry.greeting'
	      defaultMessage='The Smart Pantry is an innovative way for people to improve their food security.'
	    />
	  </p>
	  <p>
	    <FormattedMessage
	      id='pages.smartPantry.explainer'
	      defaultMessage={`Once you find a Smart Pantry on your campus, you can scan in the QR code on it. Take a quick survey and you'll be given points to exchange for any items in the machine.`}
	    />
	  </p>
	</IonText>
      </IonCol>
    </IonRow>
  </IonGrid>;
};
