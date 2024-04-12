import {Redirect} from 'react-router-dom';
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
  const {isLoggedIn, user} = useProfile();
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
    return <Redirect to='/signup' />;
  }
  return children;
};
