import {
  IonContent,
  IonText
} from '@ionic/react';

export const NotFound: React.FC = () => {
  return <IonContent data-testid='not found page'>
    <IonText>
      <h1>
	not found
      </h1>
    </IonText>
  </IonContent>;
}
