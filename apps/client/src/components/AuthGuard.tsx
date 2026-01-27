import {Redirect} from 'react-router-dom';
import {useAlerts} from '@/hooks/Alerts';
import {
  useEffect,
  useState
} from 'react';
import {useIonViewDidEnter} from '@ionic/react';
import {useMessaging} from '@/hooks/Messaging';
import {useProfile} from '@/hooks/Profile';

// assume any pages not listed require authentication
const authLookups: Record<string, 'authed' | 'unauthed' | 'any'> = {
  '/login': 'unauthed',
  '/reset-password': 'unauthed',
  '/signup': 'unauthed',
  '/privacy-policy': 'any',
  '/page-not-found': 'any'
};

export const AuthGuard: React.FC<React.PropsWithChildren> = ({children}) => {
  const {
    isLoggedIn,
    requestedUrl,
    requestedUrlSignoutFlag,
    user,    
  } = useProfile();
  const {
    enable,
    permission
  } = useMessaging();
  const {addAlert} = useAlerts();
  useIonViewDidEnter(() => {
    if(user !== null
       && user.emailVerified === true){
      switch(permission){
	case undefined:
	case null:
	case 'prompt':
	case 'prompt-with-rationale':
	  enable();
	  break;
	case 'denied':
	  addAlert('messaging.alert.denied', {message: 'messaging.alert.denied'});
	  break;
      }
    }
  }, [
    enable,
    permission,
    user,
  ]);

  const [pathname, setPathname] = useState<string | null>(null);
  
  useEffect(() => {
    setPathname(window.location.pathname);
  }, []);
  if(pathname === null){
    return <></>; // TODO: implement react suspense to propagate 
  };
  
  const requiredAuth = authLookups[pathname] ?? 'authed';

  if(isLoggedIn
     && user.emailVerified === false
     && pathname !== '/verify-email'){
    return <Redirect to='/verify-email' />;
  }
  if(isLoggedIn
     && requiredAuth === 'unauthed'
     && user.emailVerified === true
     && pathname !== '/verify-email'){
    return <Redirect to='/map' />;
  }
  
  if(!isLoggedIn && requiredAuth === 'authed'){
    if(requestedUrlSignoutFlag.current === false){
      requestedUrl.current = window.location.pathname;
    }else{
      requestedUrlSignoutFlag.current = false;
    }
    return <Redirect to='/signup' />;
  }
  return children;
};
