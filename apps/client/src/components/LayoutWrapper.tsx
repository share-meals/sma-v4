import {AuthGuard} from '@/components/AuthGuard';
import {IonContent} from '@ionic/react';

interface props {
  i18nTitle: string;
}

export const LayoutWrapper: React.FC<React.PropsWithChildren<props>> = ({
  children,
  i18nTitle
}) => {
  const style = {
    backgroundColor: '#ffffff',
    minHeight: '100%',
    maxWidth: 768,
    margin: 'auto',
    padding: 0,
    paddingTop: '3rem'
  };
  return <AuthGuard>
    <IonContent>
      <div style={style}>
	{children}
      </div>
    </IonContent>
  </AuthGuard>;
}
