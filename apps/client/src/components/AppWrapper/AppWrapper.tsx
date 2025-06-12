import {IonProgressBar} from '@ionic/react';
import Logo from '@/assets/svg/logo.svg';
import {
  useEffect,
  useState,
} from 'react';
import {useI18n} from '@/hooks/I18n';
import {useProfile} from '@/hooks/Profile';
import {useIntl} from 'react-intl';

import './AppWrapper.css';

export const AppWrapper: React.FC<React.PropsWithChildren> = ({children}) => {
  const {isLoading: isProfileLoading} = useProfile();
  const {dateFnsLocale, language} = useI18n();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const queryParams = new URLSearchParams(window.location.search);
  const testAppLoadingScreen = queryParams.get('testAppLoadingScreen');
  const intl = useIntl();
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
     || testAppLoadingScreen !== null){
    return <main id='appLoadingIndicator'>
      <img src={Logo} alt={intl.formatMessage({id: 'img.alt.appWrapper'})} />
      <IonProgressBar
	aria-label='xxx'
	type='indeterminate'
      />
    </main>;
  }else{
    return children;
  }
};
