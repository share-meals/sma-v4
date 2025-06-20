import {AuthGuard} from '@/components/AuthGuard';
import {IonContent} from '@ionic/react';

export const LayoutWrapper: React.FC<React.PropsWithChildren> = ({children}) => {
  const style = {
    backgroundColor: '#ffffff',
    minHeight: '100%',
    maxWidth: 768,
    margin: 'auto',
    padding: 0,
  };
  return <AuthGuard>
    <IonContent>
      <div style={style}>
	{children}
      </div>
    </IonContent>
  </AuthGuard>;
}
