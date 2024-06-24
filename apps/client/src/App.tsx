//import {FirebaseProvider} from '@/hooks/Firebase';
import {AlertsProvider} from '@/hooks/Alerts';
import {AppWrapper} from '@/components/AppWrapper';
import {I18nProvider} from '@/hooks/I18n';
import '@/components/Firebase';
import {
  IonApp,
  setupIonicReact
} from '@ionic/react';
import {GeolocationProvider} from '@/hooks/Geolocation';
import {LoggerProvider} from '@/hooks/Logger';
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

export const App: React.FC = () => {
  return <IonApp>
    <LoggerProvider>
      <I18nProvider>
	<AlertsProvider>
	  <MessagingProvider>
	    <ProfileProvider>
	      <AppWrapper>
		<GeolocationProvider>
		  <UsersProvider>
		    <Router />
		  </UsersProvider>
		</GeolocationProvider>
	      </AppWrapper>
	    </ProfileProvider>
	  </MessagingProvider>
	</AlertsProvider>
      </I18nProvider>
    </LoggerProvider>
    <ToastContainer />
  </IonApp>;
}
