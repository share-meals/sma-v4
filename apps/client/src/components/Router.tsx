// TODO: badge on footer is different color if Map is not active

import {
  ActionPerformed,
  PushNotifications
} from '@capacitor/push-notifications';
import {Capacitor} from '@capacitor/core';
import classnames from 'classnames';
import {FormattedMessage} from 'react-intl';
import {
  IonBadge,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
} from '@ionic/react';
import {IonReactRouter} from '@ionic/react-router';
import {LayoutWrapper} from '@/components/LayoutWrapper';
import {PostFormProvider} from '@/hooks/PostForm';
import {
  Redirect,
  Route
} from 'react-router-dom';
import {ShareFormProvider} from '@/hooks/ShareForm';
import {useEffect} from 'react';
import {useHistory} from 'react-router-dom';
import {useProfile} from '@/hooks/Profile';

import {Account} from '@/pages/Account';
import {CloseAccount} from '@/pages/CloseAccount';
import {Login} from '@/pages/Login';
import {Map} from '@/pages/Map';
import {
  MessagesDashboard
} from '@/pages/Messages';
import {normalizeForUrl} from '@/utilities/normalizeForUrl';
import {PageNotFound} from '@/pages/PageNotFound';
import {Post} from '@/pages/Post';
import {PrivacyPolicy} from '@/pages/PrivacyPolicy';
import {ResetPassword} from '@/pages/ResetPassword';
import {Share} from '@/pages/Share';
import {Signup} from '@/pages/Signup';
import {SmartPantryDashboard} from '@/pages/SmartPantry';
import {VerifyEmail} from '@/pages/VerifyEmail';
import {ViewPost} from '@/pages/ViewPost';
import {ViewShare} from '@/pages/ViewShare';

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
	if(data.source === 'bundle'){
	  history.push(`/view-bundle-post/${normalizeForUrl(data.bundleName)}/${data.id}`);
	}
	if(data.source === 'event'){
	  history.push(`/view-post/${data.id}`);
	}
	if(data.source === 'share'){
	  history.push(`/view-share/${data.id}`);
	}
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
    bundlePostsLength,
    features,
    isLoggedIn,
    postsLength,
  } = useProfile();
  return <IonReactRouter>
    <PushNotificationActionListener />
    <nav>
      <IonTabs>
	<IonRouterOutlet>
	  <Route exact path='/login'>
	    <LayoutWrapper>
	      <Login />
	    </LayoutWrapper>
	  </Route>
	  <Route exact path='/reset-password'>
	    <LayoutWrapper>
	      <ResetPassword />
	    </LayoutWrapper>
	  </Route>
	  <Route exact path='/map'>
	    <LayoutWrapper>
	      <Map />
	    </LayoutWrapper>
	  </Route>
	  <Route exact path='/verify-email'>
	    <LayoutWrapper>
	      <VerifyEmail />
	    </LayoutWrapper>
	  </Route>
	  <Route exact path='/post'>
	    <LayoutWrapper>
	      <PostFormProvider>
		<Post />
	      </PostFormProvider>
	    </LayoutWrapper>
	  </Route>
	  <Route exact path='/messages/dashboard'>
	    <LayoutWrapper>
	      <MessagesDashboard />
	    </LayoutWrapper>
	  </Route>
	  <Route exact path='/view-bundle-post/:bundleId/:id'>
	    <LayoutWrapper>
	      <ViewPost source={'bundle'} />
	    </LayoutWrapper>
	  </Route>
	  <Route exact path='/view-post/:id'>
	    <LayoutWrapper>
	      <ViewPost />
	    </LayoutWrapper>
	  </Route>
	  <Route exact path='/view-share/:id'>
	    <LayoutWrapper>
	      <ViewShare />
	    </LayoutWrapper>
	  </Route>
	  <Route exact path='/share'>
	    <LayoutWrapper>
	      <ShareFormProvider>
		<Share />
	      </ShareFormProvider>
	    </LayoutWrapper>
	  </Route>
	  <Route exact path='/signup'>
	    <LayoutWrapper>
	      <Signup />
	    </LayoutWrapper>
	  </Route>
	  <Route exact path='/account'>
	    <LayoutWrapper>
	      <Account />
	    </LayoutWrapper>
	  </Route>
	  <Route exact path='/close-account'>
	    <LayoutWrapper>
	      <CloseAccount />
	    </LayoutWrapper>
	  </Route>
	  <Route exact path='/'>
	    {isLoggedIn ? <Redirect to='/map' /> : <Redirect to='/signup' />}
	  </Route>
  	  <Route exact path='/privacy-policy'>
	    <LayoutWrapper>
	      <PrivacyPolicy />
	    </LayoutWrapper>
	  </Route>
	  <Route exact path='/smart-pantry/:spid'>
	    <LayoutWrapper>
	      <SmartPantryDashboard />
	    </LayoutWrapper>
	  </Route>
	  <Route exact path='/page-not-found'>
	    <LayoutWrapper>
	      <PageNotFound />
	    </LayoutWrapper>
	  </Route>
	  <Route>
	    <Redirect to='/page-not-found' />
	  </Route>
	</IonRouterOutlet>
	<IonTabBar color='primary' slot='bottom' aria-label='xxx'>
	  <IonTabButton
	    className={isLoggedIn ? 'ion-hide' : ''}
	    data-testid='footer.button.login'
	    href='/login'
	    tab='login'
	  >
	    <IonIcon aria-hidden='true' icon={LoginIcon} />
	    <IonLabel>
	      <FormattedMessage id='pages.login.title' />
	    </IonLabel>
	  </IonTabButton>
	  <IonTabButton
	    className={isLoggedIn ? 'ion-hide' : ''}
	    data-testid='footer.button.signup'
	    href='/signup'
	    tab='signup'
	  >
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
	      {postsLength + bundlePostsLength > 0 &&
	       <IonBadge color='light'>
		 {postsLength + bundlePostsLength}
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
	  {
	    features.canShare.length > 0 &&
	    <IonTabButton data-testid='share button' tab='share' href='/share' layout='icon-top' className={isLoggedIn ? '' : 'ion-hide'}>
	      <IonIcon aria-hidden='true' src={PostIcon} />
	      <IonLabel>
		<FormattedMessage id='pages.share.title' />
	      </IonLabel>
	    </IonTabButton>
	  }
	  <IonTabButton
	    className={isLoggedIn ? '' : 'ion-hide'}
	    data-testid='footer.button.account'
	    href='/account'
	    tab='account'
	  >
	    <IonIcon aria-hidden='true' src={AccountIcon} />
	    <IonLabel>
	      <FormattedMessage id='pages.account.title' />
	    </IonLabel>
	  </IonTabButton>
	</IonTabBar>
      </IonTabs>
    </nav>
  </IonReactRouter>;
}
