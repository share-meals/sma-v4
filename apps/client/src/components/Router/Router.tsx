// todo: lazy loading components

import {AuthGuard} from '@/components/AuthGuard';
import {FormattedMessage} from 'react-intl';
import {GeolocationWrapper} from '@/components/GeolocationWrapper';
import {
  IonBadge,
  IonIcon,
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonLabel,
  IonRouterOutlet,
} from '@ionic/react';
import {IonReactRouter} from '@ionic/react-router';
import {LayoutWrapper} from '@/components/LayoutWrapper';
//import {LoadingIndicator} from '@/components/LoadingIndicator';
import {
  Redirect,
  Route
} from 'react-router-dom';
import {useCommunities} from '@/contexts/Communities';
import {usePosts} from '@/contexts/Posts';
import {useProfile} from '@/contexts/Profile';
import {useSigninCheck} from 'reactfire';

import {Account} from '@/pages/Account';
import {Login} from '@/pages/Login';
import {Signup} from '@/pages/Signup';
import {Map} from '@/pages/Map';
import {NotFound} from '@/pages/NotFound';
import {PrivacyPolicy} from '@/pages/PrivacyPolicy';
import {
  SmartPantryInfo,
  SmartPantryDashboard,
  SmartPantrySurvey,
  SmartPantryVend,
} from '@/pages/SmartPantry';
import {VerifyEmail} from '@/pages/VerifyEmail';

import LoginIcon from '@material-design-icons/svg/sharp/login.svg';
import ManageAccountsIcon from '@material-design-icons/svg/sharp/manage_accounts.svg';
import MapIcon from '@material-design-icons/svg/sharp/map.svg';
import PersonAddAltIcon from '@material-design-icons/svg/sharp/person_add_alt.svg';
import SettingsSuggestIcon from '@material-design-icons/svg/sharp/settings_suggest.svg';

export const Router: React.FC = () => {
  const {data} = useSigninCheck();
  const {communities} = useCommunities();
  const {posts} = usePosts();

  return <IonReactRouter>
    <IonTabs>
      <IonRouterOutlet>
	<Route exact path='/'>
	  {data.signedIn
	  ? <Redirect to='/map' />
	  : <Redirect to='/signup' />}
	</Route>
	<Route exact path="/login">
	  <AuthGuard requiredAuth='unauthed'>
	    <LayoutWrapper
	      title='login'
	      translatedTitle={<FormattedMessage
				 id='pages.login.title'
				 defaultMessage='Login'
	      />}>
	      <Login />
	    </LayoutWrapper>
	  </AuthGuard>
	</Route>
	<Route exact path="/signup">
	  <AuthGuard requiredAuth='unauthed'>
	    <LayoutWrapper
	      title='signup'
	      translatedTitle={<FormattedMessage
				 id='pages.signup.title'
				 defaultMessage='Signup'
	      />}>
	      <Signup />
	    </LayoutWrapper>
	  </AuthGuard>
	</Route>
	
	<Route exact path="/account">
	  <AuthGuard requiredAuth='authed'>
	    <LayoutWrapper
	      title='account'
	      translatedTitle={<FormattedMessage
				 id='pages.account.title'
				 defaultMessage='Account'
	      />}>
	      <Account />
	    </LayoutWrapper>
	  </AuthGuard>
	</Route>
	<Route exact path="/map">
	  <AuthGuard requiredAuth='authed'>
	    <LayoutWrapper
	      isFullscreen={true}
	      title='map'
	      translatedTitle={<FormattedMessage
				 id='pages.map.title'
				 defaultMessage='Map'
	      />}>
	      <GeolocationWrapper>
		<Map />
	      </GeolocationWrapper>
	    </LayoutWrapper>
	  </AuthGuard>
	</Route>

	<Route exact path='/privacy-policy'>
	  <AuthGuard requiredAuth='any'>
	    <LayoutWrapper
	      title='privacyPolicy'
	      translatedTitle={<FormattedMessage
				 id='pages.privacyPolicy.title'
				 defaultMessage='Privacy Policy'
	      />}>
	      <PrivacyPolicy />
	    </LayoutWrapper>
	  </AuthGuard>
	</Route>

	<Route exact path='/smart-pantry'>
	  <AuthGuard requiredAuth='authed' requiredFeature='canSmartPantry'>
	    <LayoutWrapper
	      title='smartPantry'
	      translatedTitle={<FormattedMessage
				 id='pages.smartPantry.title'
				 defaultMessage='Smart Pantry'
	      />}>
	      <SmartPantryInfo />
	    </LayoutWrapper>
	  </AuthGuard>
	</Route>

	<Route exact path='/smart-pantry/:spid'>
	  <AuthGuard requiredAuth='authed' requiredFeature='canSmartPantry'>
	    <LayoutWrapper
	      title='smartPantry'
	      translatedTitle={<FormattedMessage
				 id='pages.smartPantryDashboard.title'
				 defaultMessage='Smart Pantry Dashboard'
	      />}>
		<SmartPantryDashboard />
	    </LayoutWrapper>
	  </AuthGuard>
	</Route>

	<Route exact path='/smart-pantry/:spid/survey'>
	  <AuthGuard requiredAuth='authed' requiredFeature='canSmartPantry'>
	    <LayoutWrapper
	      title='smartPantry'
	      translatedTitle={<FormattedMessage
				 id='pages.smartPantrySurvey.title'
				 defaultMessage='Smart Pantry Survey'
	      />}>
	      <SmartPantrySurvey />
	    </LayoutWrapper>
	  </AuthGuard>
	</Route>

	<Route exact path='/smart-pantry/:spid/vend'>
	  <AuthGuard requiredAuth='authed' requiredFeature='canSmartPantry'>
	    <LayoutWrapper
	      title='smartPantry'
	      translatedTitle={<FormattedMessage
				 id='pages.smartPantryVend.title'
				 defaultMessage='Smart Pantry Vend'
	      />}>
	      <SmartPantryVend />
	    </LayoutWrapper>
	  </AuthGuard>
	</Route>

	
	<Route exact path='/verify-email'>
	  <AuthGuard requiredAuth='authed'>
	    <LayoutWrapper
	      title='verifyEmail'
	      translatedTitle={<FormattedMessage
				 id='pages.verifyEmail.title'
				 defaultMessage='Verify Email'
	      />}>
	      <VerifyEmail />
	    </LayoutWrapper>
	  </AuthGuard>
	</Route>

	
	<Route>
	  <NotFound />
	</Route>
      </IonRouterOutlet>
      <IonTabBar slot='bottom' color='primary'>
	{!data.signedIn &&
	 <IonTabButton data-testid='login button' tab='login' href='/login'>
	   <IonIcon aria-hidden='true' src={LoginIcon}/>
	   <IonLabel>
	     Login
	   </IonLabel>
	 </IonTabButton>}
	{!data.signedIn &&
	 <IonTabButton data-testid='signup button' tab='signup' href='/signup'>
	   <IonIcon aria-hidden='true' src={PersonAddAltIcon} />
	   <IonLabel>
	     Signup
	   </IonLabel>
	 </IonTabButton>}
	{data.signedIn &&
	 <IonTabButton data-testid='map button' tab='map' href='/map' layout='icon-top'>
	   <IonIcon aria-hidden='true' src={MapIcon} />
	   <IonLabel>
	     Map
	   </IonLabel>
	   {posts.length > 0 && <IonBadge color='secondary' mode='ios'>
	     {posts.length}
	   </IonBadge>
	   }
	 </IonTabButton>}

	{data.signedIn
	&& communities
	&& Object.keys(communities.canSmartPantry).length > 0
	&& <IonTabButton data-testid='smart pantry button' tab='smart pantry' href='/smart-pantry'>
	  <IonIcon aria-hidden='true' src={SettingsSuggestIcon} />
	  <IonLabel>
	    Smart Pantry
	  </IonLabel>
	</IonTabButton>}
	

	{data.signedIn
	&& <IonTabButton data-testid='account button' tab='account' href='/account'>
	  <IonIcon aria-hidden='true' src={ManageAccountsIcon} />
	  <IonLabel>
	    Account
	  </IonLabel>
	</IonTabButton>}
	
      </IonTabBar>
    </IonTabs>
  </IonReactRouter>;
}

