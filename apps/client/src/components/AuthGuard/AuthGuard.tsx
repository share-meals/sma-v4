// todo: need to check if email is verified

import {LoadingIndicator} from '@/components/LoadingIndicator';
import {Redirect} from 'react-router-dom';
import {useCommunities} from '@/contexts/Communities';
import {useLocation} from 'react-router-dom';
import {useProfile} from '@/contexts/Profile';
import {useUser} from 'reactfire';

interface props {
  requiredAuth: 'any' | 'authed' | 'unauthed' | 'unverified',
  requiredFeature?: 'canPost' | 'canShare' | 'canSmartPantry'
}

export const AuthGuard: React.FC<React.PropsWithChildren<props>> = ({
  children,
  requiredAuth,
  requiredFeature,
}) => {
  const {communities} = useCommunities();
  const {/*status,*/ data} = useUser();
  const {pathname} = useLocation();

  /*
  if(status === 'loading'){
    return <LoadingIndicator />;
  }
  */
  
  if(requiredFeature === 'canPost'
     && (communities === null
      || Object.keys(communities.canPost).length === 0)){
    return <Redirect to='/' />;    
  }
  
  if(requiredFeature === 'canShare'
     && (communities === null
      || Object.keys(communities.canShare).length === 0)){
    return <Redirect to='/' />;    
  }

  console.log(communities);
  if(requiredFeature === 'canSmartPantry'
     && (communities === null
      || communities === undefined
      || Object.keys((communities.canSmartPantry)).length === 0)){
    return <Redirect to='/' />;    
  }

  if(data !== null
     && pathname !== '/verify-email'
     && data.emailVerified === false
  ){
    return <Redirect to='/verify-email' />;
  }
  
  if(data !== null
     && requiredAuth === 'unauthed'){
    return <Redirect to='/' />;
  }

  if(data === null
     && requiredAuth === 'authed'){
    return <Redirect to='/' />;
  }


  // TODO: check unverified
  // implied that requiredAuth === 'any' will render

  return children;
}
