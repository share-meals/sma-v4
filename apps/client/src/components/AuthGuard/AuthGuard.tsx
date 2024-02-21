// todo: need to check if email is verified

import {LoadingIndicator} from '@/components/LoadingIndicator';
import {Redirect} from 'react-router-dom';
import {useCommunities} from '@/contexts/Communities';
import {useLocation} from 'react-router-dom';
//import {useAuthGuard} from '@/contexts/AuthGuard';
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
  //const {url, setUrl} = useAuthGuard();
  const {communities} = useCommunities();
  const {data} = useUser();
  // @ts-ignore
  const {pathname, location} = useLocation();
  if(data !== null){
    if(data.emailVerified === false
       && pathname !== '/verify-email'
      && (location !== undefined && location.pathname !== '/verify-email')
    ){
      return <Redirect to='/verify-email' />;
    }
    if(requiredAuth === 'unauthed'){
      return <Redirect to='/' />;
    }
  }


  if(data === null
     && requiredAuth === 'authed'){
    return <Redirect to='/' />;
  }
  //  
//  console.log(a);
  /*

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

  if(requiredFeature === 'canSmartPantry'
     && (communities === null
      || communities === undefined
      || Object.keys((communities.canSmartPantry)).length === 0)){
    return <Redirect to='/' />;    
  }
  

*/
  // TODO: check unverified
  // implied that requiredAuth === 'any' will render

  return children;
}
