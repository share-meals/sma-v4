import {Redirect} from 'react-router-dom';
import {useProfile} from '@/hooks/Profile';

export interface AuthGuardProps {
  requiredAuth: 'any' | 'authed' | 'unauthed';
}

export const AuthGuard: React.FC<React.PropsWithChildren<AuthGuardProps>> = ({
  children,
  requiredAuth,
}) => {
  const {isLoggedIn} = useProfile();
  if(isLoggedIn && requiredAuth === 'unauthed'){
    return <Redirect to='/map' />;
  }
  if(!isLoggedIn && requiredAuth === 'authed'){
    return <Redirect to='/signup' />;
  }
  return <div>
    {children}
  </div>
};
