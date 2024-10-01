// TODO: badge on footer is different color if Map is not active

import {
  ActionPerformed,
  PushNotifications
} from '@capacitor/push-notifications';
import {AuthGuard} from '@/components/AuthGuard';
import {Capacitor} from '@capacitor/core';
import classnames from 'classnames';
import {
  IonBadge,
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
import {PostFormProvider} from '@/hooks/PostForm';
import {
  Redirect,
  Route
} from 'react-router-dom';
import {useEffect} from 'react';
import {useHistory} from 'react-router-dom';
import {useProfile} from '@/hooks/Profile';

import {Account} from '@/pages/Account';
import {CloseAccount} from '@/pages/CloseAccount';
import {Login} from '@/pages/Login';
import {Map} from '@/pages/Map';
import {PageNotFound} from '@/pages/PageNotFound';
import {Post} from '@/pages/Post';
import {PrivacyPolicy} from '@/pages/PrivacyPolicy';
import {ResetPassword} from '@/pages/ResetPassword';
import {Signup} from '@/pages/Signup';
import {
  SmartPantry,
  SmartPantrySurvey
} from '@/pages/SmartPantry';
import {VerifyEmail} from '@/pages/VerifyEmail';
import {ViewPost} from '@/pages/ViewPost';

import AccountIcon from '@material-symbols/svg-400/rounded/manage_accounts-fill.svg';
import LoginIcon from '@material-symbols/svg-400/rounded/security_update_good-fill.svg';
import MapIcon from '@material-symbols/svg-400/rounded/map-fill.svg';
import SignupIcon from '@material-symbols/svg-400/rounded/person_add-fill.svg';
import PostIcon from '@material-symbols/svg-400/rounded/rss_feed.svg';

const PushNotificationActionListener: React.FC = () => {
  const history = useHistory();
  useEffect(() => {
    // handle when push notification is clicked
    if(Capacitor.isNative){
      PushNotifications.addListener('pushNotificationActionPerformed', (event: ActionPerformed) => {
	const data = event.notification.data;
	switch(data.source){
	  case 'post':
	    history.push(`/view-post/${data.id}`);
	    break;
	  default:
	    // do nothing
	    break;
	};
      });
      return () => {
	PushNotifications.removeAllListeners();
      }
    }
    return () => {};
  }, []);
  return <></>;
}

export const Router: React.FC = () => {
  const {
    features,
    isLoggedIn,
    posts,
  } = useProfile();
  const postsLength = Object.keys(posts).length;
  return <IonReactRouter>
	<PushNotificationActionListener />
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
        <Route exact path='/reset-password'>
	  <AuthGuard requiredAuth='unauthed'>
	    <LayoutWrapper
	      translatedTitle={<FormattedMessage id='pages.resetPassword.title' />}>
              <ResetPassword />
	    </LayoutWrapper>
	  </AuthGuard>
        </Route>
	<Route exact path='/map'>
	  <AuthGuard requiredAuth='authed'>
	    <LayoutWrapper
	      translatedTitle={<FormattedMessage id='pages.map.title' />}>
	      <Map />
	    </LayoutWrapper>
	  </AuthGuard>
	</Route>
	<Route exact path='/verify-email'>
	  <AuthGuard requiredAuth='authed' checkIsEmailVerified={false}>
	    <LayoutWrapper
	      translatedTitle={<FormattedMessage id='pages.map.verifyEmail' />}>
	      <VerifyEmail />
	    </LayoutWrapper>
	  </AuthGuard>
	</Route>
	<Route exact path='/post'>
	  <AuthGuard requiredAuth='authed'>
	    <LayoutWrapper
	      translatedTitle={<FormattedMessage id='pages.post.title' />}>
	      <PostFormProvider>
		<Post />
	      </PostFormProvider>
	    </LayoutWrapper>
	  </AuthGuard>
	</Route>
	<Route exact path='/view-post/:id'>
	  <AuthGuard requiredAuth='authed'>
	    <LayoutWrapper
	      translatedTitle={<FormattedMessage id='pages.viewPost.title' />}>
	      <ViewPost />
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
	<Route exact path='/close-account'>
	  <AuthGuard requiredAuth='authed'>
	    <LayoutWrapper
	      translatedTitle={<FormattedMessage id='pages.closeAccount.title' />}>
	      <CloseAccount />
	    </LayoutWrapper>
	  </AuthGuard>
	</Route>
	<Route exact path='/'>
	  {isLoggedIn ? <Redirect to='/map' /> : <Redirect to='/signup' />}
	</Route>
  	<Route exact path='/privacy-policy'>
	  <AuthGuard requiredAuth='any'>
	    <LayoutWrapper
	      translatedTitle={<FormattedMessage id='pages.privacyPolicy.title' />}>
	      <PrivacyPolicy />
	    </LayoutWrapper>
	  </AuthGuard>
	</Route>
	<Route exact path='/smart-pantry/:spid'>
	  <AuthGuard requiredAuth='authed'>
	    <LayoutWrapper
	      translatedTitle={<FormattedMessage id='pages.smartPantry.title' />}>
	      <SmartPantry />
	    </LayoutWrapper>
	  </AuthGuard>
	</Route>
	<Route exact path='/smart-pantry/survey/:spid'>
	  <AuthGuard requiredAuth='authed'>
	    <LayoutWrapper
	      translatedTitle={<FormattedMessage id='pages.smartPantrySurvey.title' />}>
	      <SmartPantrySurvey />
	    </LayoutWrapper>
	  </AuthGuard>
	</Route>
	<Route exact path='/page-not-found'>
	  <LayoutWrapper
	    translatedTitle={<FormattedMessage id='pages.pageNotFound.title' />}>
	    <PageNotFound />
	  </LayoutWrapper>
	</Route>
	<Route>
	  <Redirect to='/page-not-found' />
	</Route>

      </IonRouterOutlet>
      <IonTabBar color='primary' slot='bottom'>
	<IonTabButton tab='login' href='/login' className={isLoggedIn ? 'ion-hide' : ''}>
          <IonIcon aria-hidden='true' icon={LoginIcon} />
          <IonLabel>
	    <FormattedMessage id='pages.login.title' />
	  </IonLabel>
        </IonTabButton>
	<IonTabButton data-testid='signup button' tab='signup' href='/signup' className={isLoggedIn ? 'ion-hide' : ''}>
	  <IonIcon aria-hidden='true' src={SignupIcon} />
	  <IonLabel>
	    <FormattedMessage id='pages.signup.title' />
	  </IonLabel>
	</IonTabButton>
	<IonTabButton data-testid='map button' tab='map' href='/map' layout='icon-top' className={
	  classnames({
	    'ion-hide': !isLoggedIn,
	    'has-badge': postsLength > 0
	  })
	}>
	  <IonIcon aria-hidden='true' src={MapIcon} />
	  <IonLabel>
	    <FormattedMessage id='pages.map.title' />
	    {postsLength > 0 &&
	     <IonBadge color='light'>
	       {postsLength}
	     </IonBadge>}
	  </IonLabel>
	</IonTabButton>
	{features.canPost.length > 0 &&
	 <IonTabButton data-testid='post button' tab='post' href='/post' layout='icon-top' className={isLoggedIn ? '' : 'ion-hide'}>
	   <IonIcon aria-hidden='true' src={PostIcon} />
	   <IonLabel>
	     <FormattedMessage id='pages.post.title' />
	   </IonLabel>
	 </IonTabButton>
	}
	<IonTabButton data-testid='account button' tab='account' href='/account' className={isLoggedIn ? '' : 'ion-hide'}>
	  <IonIcon aria-hidden='true' src={AccountIcon} />
	  <IonLabel>
	    <FormattedMessage id='pages.account.title' />
	  </IonLabel>
	</IonTabButton>
      </IonTabBar>
    </IonTabs>
  </IonReactRouter>;
}
