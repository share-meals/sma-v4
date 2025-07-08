import {AuthGuard} from '@/components/AuthGuard';
import {Footer} from '@/components/Footer';
import {
  IonContent,
  IonPage
} from '@ionic/react';
import {Header} from '@/components/Header';

interface LayoutWrapperProps {
  i18nKey: string
}

export const LayoutWrapper: React.FC<React.PropsWithChildren<LayoutWrapperProps>> = ({
  children,
  i18nKey
}) => {
  const style = {
    backgroundColor: '#ffffff',
    minHeight: '100%',
    maxWidth: 768,
    margin: 'auto',
    padding: 0,
  };
  return <AuthGuard>
    <IonPage>
      <Header i18nKey={i18nKey} />
      <IonContent>
	<div style={style}>
	  {children}
	</div>
      </IonContent>
      <Footer />
    </IonPage>
  </AuthGuard>;
}
