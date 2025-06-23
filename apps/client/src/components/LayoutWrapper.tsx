import {AuthGuard} from '@/components/AuthGuard';
import {
  IonContent,
  IonPage
} from '@ionic/react';

export const LayoutWrapper: React.FC<React.PropsWithChildren> = ({children}) => {
  const style = {
    backgroundColor: '#ffffff',
    minHeight: '100%',
    maxWidth: 768,
    margin: 'auto',
    padding: 0,
  };
  return <AuthGuard>
    <IonPage>
      <IonContent>
	<div style={style}>
	  {children}
	</div>
      </IonContent>
    </IonPage>
  </AuthGuard>;
}
