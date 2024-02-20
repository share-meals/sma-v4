import {Header} from '@/components/Header';
import {
  IonContent,
  IonPage
} from '@ionic/react';

interface props {
  isFullscreen?: boolean,
  title: string,
  translatedTitle: React.ReactNode,
}

export const LayoutWrapper: React.FC<React.PropsWithChildren<props>> = ({
  children,
  isFullscreen = false,
  title,
  translatedTitle,
}) => {
  const classes: string = [
    'background-light',
    'margin-horizontal-auto',
    !isFullscreen ? 'ion-padding' : '',
    !isFullscreen ? 'max-width-md' : '',
  ].join(' ');
  return <IonPage>
    <Header translatedTitle={translatedTitle} />
    <IonContent
      className='main'
      data-testid={`${title} page`}>
      <div className={classes}>
	{children}
      </div>
    </IonContent>
  </IonPage>;
}
