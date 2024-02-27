import {Header} from '@/components/Header';
import {
  IonContent,
  IonPage
} from '@ionic/react';
import {useProfile} from '@/hooks/Profile';

interface props {
  isFullscreen?: boolean;
  translatedTitle: React.ReactNode;
}

export const LayoutWrapper: React.FC<React.PropsWithChildren<props>> = ({
  children,
  isFullscreen = false,
  translatedTitle
}) => {
  const style = {
    backgroundColor: 'var(--ion-color-light)',
    minHeight: '100%',
    maxWidth: 768,
    margin: 'auto',
    padding: isFullscreen ? 0 : '2rem'
  };
  return <IonPage>
    <Header translatedTitle={translatedTitle} />
    <IonContent>
      <div style={style}>
	{children}
      </div>
    </IonContent>
  </IonPage>;
}
