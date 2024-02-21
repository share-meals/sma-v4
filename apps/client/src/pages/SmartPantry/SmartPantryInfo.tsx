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
      <IonCol size-xs='6' push-xs='3' push-sm='0'>
	<IonImg
	className='animate-wind responsive square'
	  src={SmartPantrySVG}
	style={{marginLeft: '1rem', marginRight: '1rem'}}/>
      </IonCol>
      <IonCol size-xs='12' size-sm='6'>
	<IonText>
	  <p>
	    <FormattedMessage
	      id='pages.smartPantry.explainer'
	      defaultMessage={`To begin, scan the QR code on a Smart Pantry on your campus!`}
	    />
	  </p>
	</IonText>
      </IonCol>
    </IonRow>
  </IonGrid>;
};
