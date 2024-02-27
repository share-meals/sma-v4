import {AuthGuard} from '@/components/AuthGuard';
import {
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
} from '@ionic/react';
import {FormattedMessage} from 'react-intl';
import {IonReactRouter} from '@ionic/react-router';
import {LayoutWrapper} from '@/components/LayoutWrapper';
import {
  Redirect,
  Route
} from 'react-router-dom';
import {useProfile} from '@/hooks/Profile';

import {Account} from '@/pages/Account';
import {Login} from '@/pages/Login';
import {Map} from '@/pages/Map';
import {Post} from '@/pages/Post';
import {Signup} from '@/pages/Signup';

import ManageAccountsIcon from '@material-design-icons/svg/sharp/manage_accounts.svg';
import MapIcon from '@material-design-icons/svg/sharp/map.svg';
import PersonAddAltIcon from '@material-design-icons/svg/sharp/person_add_alt.svg';

export const Router: React.FC = () => {
  const {isLoggedIn} = useProfile();
  return <IonReactRouter>
    <IonTabs>
      <IonRouterOutlet>
        <Route exact path='/login'>
	  <AuthGuard requiredAuth='unauthed'>
	    <LayoutWrapper
	      translatedTitle={<FormattedMessage id='pages.login.title' />}>
              <Login />
	    </LayoutWrapper>
	  </AuthGuard>
        </Route>
	<Route exact path='/map'>
	  <AuthGuard requiredAuth='authed'>
	    <LayoutWrapper
	      isFullscreen={true}
	      translatedTitle={<FormattedMessage id='pages.map.title' />}>
	      <Map />
	    </LayoutWrapper>
	  </AuthGuard>
	</Route>
	<Route exact path='/post'>
	  <AuthGuard requiredAuth='authed'>
	    <LayoutWrapper
	      translatedTitle={<FormattedMessage id='pages.post.title' />}>
	      <Post />
	    </LayoutWrapper>
	  </AuthGuard>
	</Route>
	<Route exact path='/signup'>
	  <AuthGuard requiredAuth='unauthed'>
	    <LayoutWrapper
	      translatedTitle={<FormattedMessage id='pages.signup.title' />}>
	      <Signup />
	    </LayoutWrapper>
	  </AuthGuard>
	</Route>
	<Route exact path='/account'>
	  <AuthGuard requiredAuth='authed'>
	    <LayoutWrapper
	      translatedTitle={<FormattedMessage id='pages.account.title' />}>
	      <Account />
	    </LayoutWrapper>
	  </AuthGuard>
	</Route>
	<Route exact path='/'>
	  {isLoggedIn ? <Redirect to='/map' /> : <Redirect to='/signup' />}
	</Route>
      </IonRouterOutlet>
      <IonTabBar color='primary' slot='bottom'>
	<IonTabButton tab='login' href='/login' className={isLoggedIn ? 'ion-hide' : ''}>
          <IonIcon aria-hidden='true' icon={ManageAccountsIcon} />
          <IonLabel>
	    <FormattedMessage id='pages.login.title' />
	  </IonLabel>
        </IonTabButton>
	<IonTabButton data-testid='signup button' tab='signup' href='/signup' className={isLoggedIn ? 'ion-hide' : ''}>
	  <IonIcon aria-hidden='true' src={PersonAddAltIcon} />
	  <IonLabel>
	    Signup
	  </IonLabel>
	</IonTabButton>
	<IonTabButton data-testid='map button' tab='map' href='/map' layout='icon-top' className={isLoggedIn ? '' : 'ion-hide'}>
	  <IonIcon aria-hidden='true' src={MapIcon} />
	  <IonLabel>
	    Map
	  </IonLabel>
	</IonTabButton>
	<IonTabButton data-testid='map button' tab='post' href='/post' layout='icon-top' className={isLoggedIn ? '' : 'ion-hide'}>
	  <IonIcon aria-hidden='true' src={MapIcon} />
	  <IonLabel>
	    Post
	  </IonLabel>
	</IonTabButton>
	<IonTabButton data-testid='account button' tab='account' href='/account' className={isLoggedIn ? '' : 'ion-hide'}>
	  <IonIcon aria-hidden='true' src={ManageAccountsIcon} />
	  <IonLabel>
	    Account
	  </IonLabel>
	</IonTabButton>
      </IonTabBar>
    </IonTabs>
  </IonReactRouter>;
}
