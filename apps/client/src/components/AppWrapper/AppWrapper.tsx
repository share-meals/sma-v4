import {IonProgressBar} from '@ionic/react';
import Logo from '@/assets/svg/logo.svg';
import {
  useEffect,
  useState,
} from 'react';
import {useProfile} from '@/hooks/Profile';

import './AppWrapper.css';


export const AppWrapper: React.FC<React.PropsWithChildren> = ({children}) => {
  const {isLoading: isProfileLoading} = useProfile();
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    if(!isProfileLoading){
      setTimeout(() => {
	setIsLoading(false);
      }, (['development', 'emulator'].includes(import.meta.env.VITE_ENVIRONMENT) ? 0 : 2)
	* 1000);
    }
  }, [isProfileLoading]);

  // doesn't work?
  if(!isProfileLoading){
    return <div id='appLoadingIndicator'>
      <img
	src={Logo}
      />
      <IonProgressBar
	type='indeterminate'
      />
    </div>;
  }else{
    return children;
  }
};
