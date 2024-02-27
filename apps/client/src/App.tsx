//import {FirebaseProvider} from '@/hooks/Firebase';
import {AppWrapper} from '@/components/AppWrapper';
import {I18nWrapper} from '@/components/I18nWrapper';
import '@/components/Firebase';
import {
  IonApp,
  setupIonicReact
} from '@ionic/react';
import {ProfileProvider} from '@/hooks/Profile';
import {Router} from '@/components/Router';

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

setupIonicReact({
  mode: 'md'
});

export const App: React.FC = () => {
  return (
    <IonApp>
      <I18nWrapper>
	<ProfileProvider>
	  <AppWrapper>
	    <Router />
	  </AppWrapper>
	</ProfileProvider>
      </I18nWrapper>
    </IonApp>
  )
}
