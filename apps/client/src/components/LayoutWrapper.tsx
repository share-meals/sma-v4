import {AuthGuard} from '@/components/AuthGuard';
import {Header} from '@/components/Header';
import {
  IonContent,
  IonPage
} from '@ionic/react';

interface props {
  translatedTitle: React.ReactNode;
}

export const LayoutWrapper: React.FC<React.PropsWithChildren<props>> = ({
  children,
  translatedTitle
}) => {
  const style = {
    backgroundColor: '#ffffff',
    minHeight: '100%',
    maxWidth: 768,
    margin: 'auto',
    padding: 0
  };
  return <AuthGuard>
    <IonPage>
    <Header translatedTitle={translatedTitle} />
    <IonContent style={{'--background': 'var(--ion-color-dark)'}}>
      <div style={style}>
	{children}
      </div>
    </IonContent>
    </IonPage>
  </AuthGuard>;
}
