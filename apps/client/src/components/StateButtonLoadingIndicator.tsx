import {IonSpinner} from '@ionic/react';
import {useIntl} from 'react-intl';

export const StateButtonLoadingIndicator: React.FC = () => {
  const intl = useIntl();

  return <IonSpinner
	   aria-label={intl.formatMessage({id: 'components.stateButtonLoadingIndicator.ariaLabel'})}
	   color='light'
	   name='circular'
  />
};
