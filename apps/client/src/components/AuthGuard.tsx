import {Redirect} from 'react-router-dom';
import {useLocation} from 'react-router-dom';
import {useProfile} from '@/hooks/Profile';

export interface AuthGuardProps {
  checkIsEmailVerified?: boolean;
  requiredAuth: 'any' | 'authed' | 'unauthed';
}

export const AuthGuard: React.FC<React.PropsWithChildren<AuthGuardProps>> = ({
  checkIsEmailVerified = true,
  children,
  requiredAuth,
}) => {
  const {
    isLoggedIn,
    requestedUrl,
    requestedUrlSignoutFlag,
    user,    
  } = useProfile();
  const {pathname} = useLocation();

  if(isLoggedIn
     && user.emailVerified === false
     && checkIsEmailVerified === true){
    return <Redirect to='/verify-email' />;
  }
  if(isLoggedIn
     && requiredAuth === 'unauthed'
     && user.emailVerified === true
     && checkIsEmailVerified === true){
    return <Redirect to='/map' />;
  }
  
  if(!isLoggedIn && requiredAuth === 'authed'){
    if(pathname !== undefined){ // not sure why this is needed
      if(requestedUrlSignoutFlag.current === false){ 
	requestedUrl.current = pathname;
      }else{
	requestedUrlSignoutFlag.current = false;
      }
    }
    return <Redirect to='/signup' />;
  }
  return children;
};
