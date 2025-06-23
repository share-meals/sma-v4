import {IonProgressBar} from '@ionic/react';
import Logo from '@/assets/svg/logo.svg';
import {useIntl} from 'react-intl';


export const AppWrapperLoadingIndicator: React.FC = () => {
  const intl = useIntl();
  return <main id='appLoadingIndicator' data-testid='appWrapper.indicator'>
    <img src={Logo} alt={intl.formatMessage({id: 'img.alt.appWrapper'})} />
    <IonProgressBar
      aria-label={intl.formatMessage({id: 'xxx'})}
      type='indeterminate'
    />
  </main>;
}
