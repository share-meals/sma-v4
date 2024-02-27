import {
  IonCard,
  IonCardContent
} from '@ionic/react';

interface Notice {
  color: string
};

export const Notice: React.FC<React.PropsWithChildren<Notice>> = ({
  children,
  color
}) => {
  return <IonCard color={color}>
    <IonCardContent>
      {children}
    </IonCardContent>
  </IonCard>
}
