//import {FirebaseProvider} from '@/hooks/Firebase';
import {Header} from '@/components/Header';
import {AuthGuard} from '@/components/AuthGuard';
import {AlertsProvider} from '@/hooks/Alerts';
import {App as CapApp} from '@capacitor/app';
import {AppWrapper} from '@/components/AppWrapper';
import {I18nProvider} from '@/hooks/I18n';
import '@/components/Firebase';
import {
  IonApp,
  setupIonicReact,
  IonPage
} from '@ionic/react';
import {GeolocationProvider} from '@/hooks/Geolocation';
import {LoggerProvider} from '@/hooks/Logger';
import {MessagesProvider} from '@/hooks/Messages';
import {MessagingProvider} from '@/hooks/Messaging';
import {ProfileProvider} from '@/hooks/Profile';
import {Router} from '@/components/Router';
import {ToastContainer} from 'react-toastify';
import {UsersProvider} from '@/hooks/Users';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';
import './theme/common.css';

import 'react-toastify/dist/ReactToastify.css';
import './theme/toastify.css'; // overwrite react-toastify colors

setupIonicReact({
  mode: 'md'
});

CapApp.addListener('appUrlOpen', (data) => {
  const requestedPath = data.url.split('https://app.sharemeals.org')[1];
  window.location.replace(requestedPath);
});

export const App: React.FC = () => {
  const style = {
    backgroundColor: '#ffffff',
    minHeight: '100%',
    maxWidth: 768,
    margin: 'auto',
    padding: 0
  };
  return <IonApp>
    <LoggerProvider>
      <I18nProvider>
	<AlertsProvider>
	  <MessagingProvider>
	    <ProfileProvider>
	      <MessagesProvider>
	      <AppWrapper>
		<GeolocationProvider>
		  <UsersProvider>
		    <IonPage>
		      <Header translatedTitle='abc' />
		      <Router />
		    </IonPage>
		  </UsersProvider>
		</GeolocationProvider>
	      </AppWrapper>
	      </MessagesProvider>
	    </ProfileProvider>
	  </MessagingProvider>
	</AlertsProvider>
      </I18nProvider>
    </LoggerProvider>
    <ToastContainer />
  </IonApp>;
}
