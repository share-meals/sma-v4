import {
  IonText,
} from '@ionic/react';
import {useProfile} from '@/hooks/Profile';

export const MessagesDashboard: React.FC = () => {
  const a = useProfile();
  console.log(a);
  return <>
    <IonText>
      You have no messages yet
    </IonText>
  </>;
};
