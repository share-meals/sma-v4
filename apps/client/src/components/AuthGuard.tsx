import {Redirect} from 'react-router-dom';
import {
  useEffect,
  useState
} from 'react';
import {useLocation} from 'react-router-dom';
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
