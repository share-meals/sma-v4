import {AppWrapperLoadingIndicator} from './AppWrapperLoadingIndicator';
import {
  useEffect,
  useState,
} from 'react';
import {useI18n} from '@/hooks/I18n';
import {useProfile} from '@/hooks/Profile';

import './AppWrapper.css';

export const AppWrapper: React.FC<React.PropsWithChildren> = ({children}) => {
  const {isLoading: isProfileLoading} = useProfile();
  const {dateFnsLocale, language} = useI18n();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const queryParams = new URLSearchParams(window.location.search);
  const testAppLoadingScreen = queryParams.get('testAppLoadingScreen');
  useEffect(() => {
    if(!isProfileLoading){
      setTimeout(() => {
	setIsLoading(false);
      }, (['development', 'emulator'].includes(import.meta.env.VITE_ENVIRONMENT) ? 0 : 2)
	* 1000);
    }
  }, [isProfileLoading]);
  
  if(!isProfileLoading
     || language === undefined
     || dateFnsLocale === undefined
     || testAppLoadingScreen !== null
     || isLoading){
    return <AppWrapperLoadingIndicator />;
  }else{
    return children;
  }
};
